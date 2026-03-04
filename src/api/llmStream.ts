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
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
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

        for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
                onChunk(line.slice(6));
            }
        }
    }
}