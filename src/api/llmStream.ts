import { api } from "@/api/client";

type StreamPayload = {
    question: string;
    news: any[];
};

export async function streamChat(
    payload: StreamPayload,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
) {
    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/news/chat/stream/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(payload),
            signal,
        }
    );

    if (!response.ok || !response.body) {
        throw new Error("Failed to connect to chat stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // SSE format: data: <token>
        const lines = chunk.split("\n");
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const token = line.replace("data: ", "");
                onChunk(token);
            }
        }
    }
}