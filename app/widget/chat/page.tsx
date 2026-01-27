"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function WidgetChat() {
    const searchParams = useSearchParams();
    const botId = searchParams.get("botId");

    const [config, setConfig] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        if (!botId) {
            console.error("No botId provided");
            return;
        }

        async function bootstrap() {
            const res = await fetch(
                `/api/widget/bootstrap?botId=${botId}`
            );
            const data = await res.json();
            setConfig(data);
            setSessionId(data.session_id);
            setMessages([
                { role: "assistant", content: data.widget.greeting },
            ]);
        }

        bootstrap();
    }, [botId]); // Add botId to dependencies

    async function sendMessage(text: string) {
        if (!sessionId) return;

        const res = await fetch("/api/widget/message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                session_id: sessionId,
                message: text,
            }),
        });

        const data = await res.json();
        setMessages((prev) => [...prev, { role: "user", content: text }, data]);
    }

    if (!botId) {
        return <div className="p-4">Error: No bot ID provided</div>;
    }

    if (!config) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 font-bold">
                {config.widget.title}
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {messages.map((m, i) => (
                    <div key={i}>{m.content}</div>
                ))}
            </main>

            <footer className="p-3">
                <input
                    placeholder="Ask something..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMessage(e.currentTarget.value);
                            e.currentTarget.value = "";
                        }
                    }}
                />
            </footer>
        </div>
    );
}