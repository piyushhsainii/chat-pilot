"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function WidgetChatContent() {
    const searchParams = useSearchParams();
    const botId = searchParams.get("botId");

    const [config, setConfig] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

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
                { role: "assistant", content: data.widget.greeting || "Hi! How can I help you?" },
            ]);
        }

        bootstrap();
    }, [botId]);

    async function sendMessage(text: string) {
        if (!sessionId || !text.trim()) return;

        // Add user message immediately
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setInputValue("");

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
        setMessages((prev) => [...prev, data]);
    }

    if (!botId) {
        return (
            <div style={{
                padding: "16px",
                fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
                Error: No bot ID provided
            </div>
        );
    }

    if (!config) {
        return (
            <div style={{
                padding: "16px",
                fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
                Loading...
            </div>
        );
    }

    const primaryColor = config.widget?.primaryColor || "#6366f1";
    const textColor = config.widget?.textColor || "#ffffff";
    const theme = config.widget?.theme || "light";
    const botName = config.widget?.title || "Chat Pilot";
    const welcomeMessage = config.widget?.greeting || "Hi! How can I help you?";

    // Inline styles to ensure they work on any website
    const styles = {
        container: {
            position: "fixed" as const,
            bottom: "24px",
            right: "24px",
            zIndex: 999999,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        chatWindow: {
            position: "absolute" as const,
            bottom: "88px",
            right: "0",
            width: "380px",
            height: "580px",
            borderRadius: "40px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column" as const,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#0f172a",
            transform: isOpen ? "scale(1) translateY(0)" : "scale(0.75) translateY(48px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "bottom right",
            // pointerEvents: isOpen ? "auto" : ("none" as const),
        },
        header: {
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: theme === "dark" ? "1px solid #1e293b" : "1px solid #f1f5f9",
            borderTop: `6px solid ${primaryColor}`,
            transform: isOpen ? "translateY(0)" : "translateY(-16px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
        },
        headerLeft: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        avatar: {
            width: "40px",
            height: "40px",
            borderRadius: "16px",
            backgroundColor: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        botName: {
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "-0.025em",
            marginBottom: "2px",
        },
        onlineStatus: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        onlineDot: {
            width: "6px",
            height: "6px",
            backgroundColor: "#10b981",
            borderRadius: "50%",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },
        onlineText: {
            fontSize: "10px",
            fontWeight: 700,
            opacity: 0.6,
            textTransform: "uppercase" as const,
            letterSpacing: "-0.025em",
        },
        closeButton: {
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
            lineHeight: 1,
            transition: "color 0.3s",
        },
        messagesArea: {
            flex: 1,
            padding: "24px",
            overflowY: "auto" as const,
            display: "flex",
            flexDirection: "column" as const,
            gap: "24px",
        },
        messageBot: {
            display: "flex",
            gap: "12px",
            transform: isOpen ? "translateX(0)" : "translateX(-16px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
        },
        messageUser: {
            display: "flex",
            justifyContent: "flex-end",
            transform: isOpen ? "translateX(0)" : "translateX(16px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
        },
        messageBubbleBot: {
            padding: "16px",
            borderRadius: "16px",
            borderTopLeftRadius: "0",
            fontSize: "14px",
            lineHeight: "1.6",
            maxWidth: "85%",
            backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            letterSpacing: "-0.025em",
        },
        messageBubbleUser: {
            padding: "16px",
            borderRadius: "16px",
            borderTopRightRadius: "0",
            fontSize: "14px",
            fontWeight: 500,
            maxWidth: "80%",
            backgroundColor: primaryColor,
            color: textColor,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            letterSpacing: "-0.025em",
        },
        smallAvatar: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#e2e8f0",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
        },
        branding: {
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "4px",
            marginTop: "auto",
            paddingBottom: "16px",
            opacity: isOpen ? 0.4 : 0,
            transform: isOpen ? "scale(1)" : "scale(0.9)",
            transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
        },
        brandingContent: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
        },
        brandingBadge: {
            backgroundColor: "#94a3b8",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 900,
            padding: "0 4px",
            borderRadius: "2px",
            letterSpacing: "-0.025em",
        },
        brandingText: {
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
        },
        footer: {
            padding: "24px",
            borderTop: theme === "dark" ? "1px solid #1e293b" : "1px solid #f1f5f9",
            transform: isOpen ? "translateY(0)" : "translateY(16px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s",
        },
        inputWrapper: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "16px",
            border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
            transition: "border-color 0.3s",
        },
        input: {
            backgroundColor: "transparent",
            fontSize: "14px",
            width: "100%",
            border: "none",
            outline: "none",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: theme === "dark" ? "#ffffff" : "#0f172a",
        },
        iconButtons: {
            display: "flex",
            gap: "16px",
            alignItems: "center",
        },
        attachButton: {
            cursor: "pointer",
            opacity: 0.5,
            transition: "opacity 0.3s",
            fontSize: "16px",
        },
        sendButton: {
            width: "32px",
            height: "32px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            backgroundColor: primaryColor,
            border: "none",
            cursor: "pointer",
            transition: "transform 0.3s",
            fontSize: "12px",
        },
        floatingButton: {
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "24px",
            boxShadow: `0 20px 50px ${primaryColor}40`,
            backgroundColor: primaryColor,
            border: "none",
            cursor: "pointer",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative" as const,
            overflow: "hidden",
        },
        iconTransition: {
            position: "absolute" as const,
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        iconOpen: {
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "scale(0.5) rotate(90deg) translateY(32px)" : "scale(1) rotate(0) translateY(0)",
        },
        iconClose: {
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "scale(1) rotate(0) translateY(0)" : "scale(0.5) rotate(-90deg) translateY(-32px)",
        },
        notificationBadge: {
            position: "absolute" as const,
            top: "12px",
            right: "12px",
            width: "12px",
            height: "12px",
            backgroundColor: "#ef4444",
            border: "2px solid #ffffff",
            borderRadius: "50%",
            display: isOpen ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        notificationPing: {
            width: "100%",
            height: "100%",
            backgroundColor: "#f87171",
            borderRadius: "50%",
            animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
            opacity: 0.75,
        },
    };

    // Add keyframes for animations
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            @keyframes ping {
                75%, 100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <div style={styles.container}>
            {/* Chat Window */}
            <div style={styles.chatWindow}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.avatar}>🤖</div>
                        <div>
                            <div style={styles.botName}>{botName}</div>
                            <div style={styles.onlineStatus}>
                                <div style={styles.onlineDot}></div>
                                <span style={styles.onlineText}>Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        style={styles.closeButton}
                        onClick={() => setIsOpen(false)}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#64748b")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    >
                        ⌄
                    </button>
                </div>

                {/* Messages Area */}
                <div style={styles.messagesArea}>
                    {messages.map((m, i) => (
                        m.role === "assistant" ? (
                            <div key={i} style={{ ...styles.messageBot, transitionDelay: `${0.2 + i * 0.1}s` }}>
                                <div style={styles.smallAvatar}>🤖</div>
                                <div style={styles.messageBubbleBot}>{m.content}</div>
                            </div>
                        ) : (
                            <div key={i} style={{ ...styles.messageUser, transitionDelay: `${0.3 + i * 0.1}s` }}>
                                <div style={styles.messageBubbleUser}>{m.content}</div>
                            </div>
                        )
                    ))}

                    {/* Branding */}
                    <div style={styles.branding}>
                        <div style={styles.brandingContent}>
                            <span style={styles.brandingBadge}>CP</span>
                            <span style={styles.brandingText}>Powered by Chat Pilot</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <div
                        style={styles.inputWrapper}
                        onFocus={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = theme === "dark" ? "#334155" : "#e2e8f0")}
                    >
                        <input
                            style={styles.input}
                            placeholder="Ask a question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage(inputValue);
                                }
                            }}
                        />
                        <div style={styles.iconButtons}>
                            <span
                                style={styles.attachButton}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.5")}
                            >
                                📎
                            </span>
                            <button
                                style={styles.sendButton}
                                onClick={() => sendMessage(inputValue)}
                                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >
                                <span>➔</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Button */}
            <button
                style={styles.floatingButton}
                onClick={() => setIsOpen(!isOpen)}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                <div style={{ ...styles.iconTransition, ...styles.iconOpen }}>
                    <span style={{ fontSize: "30px" }}>💬</span>
                </div>
                <div style={{ ...styles.iconTransition, ...styles.iconClose }}>
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>✕</span>
                </div>
                {!isOpen && (
                    <span style={styles.notificationBadge}>
                        <span style={styles.notificationPing}></span>
                    </span>
                )}
            </button>
        </div>
    );
}

export default function WidgetChat() {
    return (
        <Suspense fallback={
            <div style={{
                padding: "16px",
                fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
                Loading...
            </div>
        }>
            <WidgetChatContent />
        </Suspense>
    );
}