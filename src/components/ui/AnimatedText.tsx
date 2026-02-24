import { useTypewriter } from "@/common/hooks/userTypewriter";

export default function AnimatedText({
    text,
    speed = 10,
    className = "",
}: {
    text: string;
    speed?: number;
    className?: string;
}) {
    const typed = useTypewriter(text, speed, true);

    return (
        <span className={className}>
            {typed}
            {typed.length < text.length && (
                <span className="animate-pulse">▍</span>
            )}
        </span>
    );
}