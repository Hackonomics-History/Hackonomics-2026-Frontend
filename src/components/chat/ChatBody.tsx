import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { Send, Square, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { NewsItem } from "@/api/types";
import { streamChat } from "@/api/llmStream";
import Button from "@/components/ui/Button";
import { raiseAppError } from "@/common/errors/raiseAppError";

type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

function uid() {
    return crypto.randomUUID();
}

export default function ChatBody({ news }: { news: NewsItem[] }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const activeAssistantIdRef = useRef<string | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const stop = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        activeAssistantIdRef.current = null;
        setLoading(false);
    }, []);

    const ask = useCallback(async () => {
        const q = question.trim();
        if (!q || loading) return;

        stop();
        abortRef.current = new AbortController();

        const userId = uid();
        const assistantId = uid();
        activeAssistantIdRef.current = assistantId;

        setMessages((prev) => [
            ...prev,
            { id: userId, role: "user", text: q },
            { id: assistantId, role: "assistant", text: "" },
        ]);

        setQuestion("");
        setLoading(true);

        try {
            await streamChat(
                { question: q, news },
                (chunk) => {
                    if (chunk === "done") return;

                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId
                                ? { ...m, text: m.text + chunk }
                                : m
                        )
                    );
                },
                abortRef.current.signal
            );
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
                return;
            }

            raiseAppError(err, undefined, "Chat failed");

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId
                        ? {
                            ...m,
                            text: "⚠️ Unable to get response. Please try again.",
                        }
                        : m
                )
            );
        } finally {
            abortRef.current = null;
            activeAssistantIdRef.current = null;
            setLoading(false);
        }
    }, [question, news, loading, stop]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") ask();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {messages.map((m) => {
                    const isThinking =
                        loading &&
                        m.role === "assistant" &&
                        m.id === activeAssistantIdRef.current &&
                        m.text === "";

                    return (
                        <div
                            key={m.id}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {m.role === "assistant" ? (
                                    isThinking ? (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    )
                                ) : (
                                    m.text
                                )}
                            </div>
                        </div>
                    );
                })}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2 items-center">
                <input
                    value={question}
                    disabled={loading}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the news..."
                    className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />

                {loading ? (
                    <Button
                        onClick={stop}
                        size="sm"
                        variant="secondary"
                        className="px-3"
                        title="Stop generating"
                    >
                        <Square size={16} />
                    </Button>
                ) : (
                    <Button onClick={ask} size="sm" className="px-3" title="Send">
                        <Send size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
}