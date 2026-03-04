import { useEffect, useState } from "react";

export function useTypewriter(
    text: string,
    speed = 12,
    start = true
) {
    const [output, setOutput] = useState("");

    useEffect(() => {
        if (!start) return;

        setOutput("");
        let i = 0;

        const timer = setInterval(() => {
            i++;
            setOutput(text.slice(0, i));
            if (i >= text.length) clearInterval(timer);
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, start]);

    return output;
}