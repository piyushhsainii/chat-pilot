"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

function WidgetChatContent() {
    const searchParams = useSearchParams();
    const botId = searchParams.get("botId");
    const embedded = searchParams.get("embedded");

    const [config, setConfig] = useState<any>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Inject minimal CSS for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            
            body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
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
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            .animate-ping {
                animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
            
            .animate-spin {
                animation: spin 1s linear infinite;
            }

            /* Custom scrollbar */
            ::-webkit-scrollbar {
                width: 6px;
            }
            
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            
            ::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `;
        document.head.appendChild(style);

        return () => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        };
    }, []);

    // Bootstrap effect
    useEffect(() => {
        if (!botId) {
            console.error("[Widget] No botId provided");
            setError("Configuration error: No bot ID provided");
            return;
        }

        async function bootstrap() {
            try {
                console.log("[Widget] Bootstrapping with botId:", botId);

                const res = await fetch(`/api/widget/bootstrap?botId=${botId}`);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("[Widget] Bootstrap failed:", res.status, errorText);
                    throw new Error(`Bootstrap failed: ${res.status}`);
                }

                const data = await res.json();
                console.log("[Widget] Bootstrap response:", data);

                if (!data) {
                    throw new Error("Bootstrap returned empty response");
                }

                setConfig(data);
                setSessionId(data.session_id || data.sessionId || null);

                // Safely get greeting message
                const greeting = data.widget?.greeting
                    || data.greeting
                    || "Hi! How can I help you?";

                setMessages([
                    { role: "assistant", content: greeting, timestamp: Date.now() },
                ]);

                // Auto-open when loaded in iframe
                if (embedded) {
                    setTimeout(() => setIsOpen(true), 100);
                }

                setError(null);
            } catch (err) {
                console.error("[Widget] Bootstrap error:", err);
                setError(err instanceof Error ? err.message : "Failed to initialize chat");
            }
        }

        bootstrap();
    }, [botId, embedded]);

    async function sendMessage(text: string) {
        if (!sessionId || !text.trim()) {
            console.warn("[Widget] Cannot send message: missing sessionId or empty text");
            return;
        }

        const trimmedText = text.trim();
        const userMessage = {
            role: "user",
            content: trimmedText,
            timestamp: Date.now()
        };

        // Add user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setError(null);

        try {
            console.log("[Widget] Sending message:", trimmedText);

            const res = await fetch("/api/widget/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    sessionId: sessionId, // Support both formats
                    message: trimmedText,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("[Widget] Message API failed:", res.status, errorText);
                throw new Error(`Failed to send message: ${res.status}`);
            }

            const data = await res.json();
            console.log("[Widget] Message response:", data);

            // Handle different response formats
            let assistantMessage;

            if (data.role && data.content) {
                // Format 1: { role: "assistant", content: "..." }
                assistantMessage = {
                    role: "assistant",
                    content: data.content,
                    timestamp: Date.now()
                };
            } else if (data.message) {
                // Format 2: { message: "..." }
                assistantMessage = {
                    role: "assistant",
                    content: data.message,
                    timestamp: Date.now()
                };
            } else if (data.response) {
                // Format 3: { response: "..." }
                assistantMessage = {
                    role: "assistant",
                    content: data.response,
                    timestamp: Date.now()
                };
            } else if (data.text) {
                // Format 4: { text: "..." }
                assistantMessage = {
                    role: "assistant",
                    content: data.text,
                    timestamp: Date.now()
                };
            } else if (typeof data === "string") {
                // Format 5: Just a string
                assistantMessage = {
                    role: "assistant",
                    content: data,
                    timestamp: Date.now()
                };
            } else {
                // Fallback: try to extract any string value
                console.warn("[Widget] Unexpected response format:", data);
                const content = data.data?.content
                    || data.data?.message
                    || data.reply
                    || JSON.stringify(data);

                assistantMessage = {
                    role: "assistant",
                    content,
                    timestamp: Date.now()
                };
            }

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("[Widget] Send message error:", err);

            // Add error message to chat
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: Date.now(),
                isError: true
            }]);

            setError(err instanceof Error ? err.message : "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    }

    // Safe config access with defaults
    const primaryColor = config?.widget?.primaryColor || config?.primaryColor || "#6366f1";
    const textColor = config?.widget?.textColor || config?.textColor || "#ffffff";
    const theme = config?.widget?.theme || config?.theme || "light";
    const botName = config?.widget?.title || config?.title || "Chat Pilot";

    // Error state
    if (error && !config) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                padding: "24px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                textAlign: "center",
                backgroundColor: "#fef2f2",
            }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#dc2626", marginBottom: "8px" }}>
                    Failed to Load Chat
                </div>
                <div style={{
                    fontSize: "14px",
                    color: "#991b1b",
                    marginBottom: "16px",
                    maxWidth: "400px",
                    padding: "12px",
                    backgroundColor: "#fee2e2",
                    borderRadius: "8px"
                }}>
                    {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#b91c1c"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Loading state
    if (!config) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "#64748b",
                gap: "16px",
            }}>
                <div style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e2e8f0",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                }} className="animate-spin"></div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>Loading chat...</div>
            </div>
        );
    }

    // Embedded mode (inside iframe)
    if (embedded) {
        const embeddedStyles = {
            container: {
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column" as const,
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#0f172a",
                fontFamily: "system-ui, -apple-system, sans-serif",
            },
            header: {
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: theme === "dark" ? "1px solid #1e293b" : "1px solid #f1f5f9",
                borderTop: `4px solid ${primaryColor}`,
                flexShrink: 0,
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            },
            headerLeft: {
                display: "flex",
                alignItems: "center",
                gap: "12px",
            },
            avatar: {
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            },
            botInfo: {
                display: "flex",
                flexDirection: "column" as const,
                gap: "2px",
            },
            botName: {
                fontWeight: 600,
                fontSize: "15px",
                letterSpacing: "-0.01em",
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
            },
            onlineText: {
                fontSize: "11px",
                fontWeight: 600,
                opacity: 0.6,
                textTransform: "uppercase" as const,
                letterSpacing: "0.03em",
            },
            messagesArea: {
                flex: 1,
                padding: "24px",
                overflowY: "auto" as const,
                display: "flex",
                flexDirection: "column" as const,
                gap: "16px",
                minHeight: 0,
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            },
            messageBot: {
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                animation: "slideIn 0.3s ease-out",
            },
            messageUser: {
                display: "flex",
                justifyContent: "flex-end",
                animation: "slideIn 0.3s ease-out",
            },
            messageBubbleBot: {
                padding: "10px 14px",
                borderRadius: "14px",
                borderTopLeftRadius: "4px",
                fontSize: "14px",
                lineHeight: "1.5",
                maxWidth: "85%",
                backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                letterSpacing: "-0.01em",
                wordWrap: "break-word" as const,
                whiteSpace: "pre-wrap" as const,
            },
            messageBubbleUser: {
                padding: "10px 14px",
                borderRadius: "14px",
                borderTopRightRadius: "4px",
                fontSize: "14px",
                fontWeight: 500,
                maxWidth: "80%",
                backgroundColor: primaryColor,
                color: textColor,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                letterSpacing: "-0.01em",
                wordWrap: "break-word" as const,
                whiteSpace: "pre-wrap" as const,
            },
            messageBubbleError: {
                padding: "10px 14px",
                borderRadius: "14px",
                borderTopLeftRadius: "4px",
                fontSize: "14px",
                lineHeight: "1.5",
                maxWidth: "85%",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                letterSpacing: "-0.01em",
                wordWrap: "break-word" as const,
                whiteSpace: "pre-wrap" as const,
            },
            smallAvatar: {
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
            },
            loadingIndicator: {
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
            },
            loadingBubble: {
                padding: "12px 16px",
                borderRadius: "14px",
                borderTopLeftRadius: "4px",
                fontSize: "14px",
                backgroundColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
                display: "flex",
                gap: "6px",
                alignItems: "center",
            },
            loadingDot: {
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#64748b" : "#94a3b8",
            },
            branding: {
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                gap: "4px",
                marginTop: "12px",
                paddingTop: "12px",
                opacity: 0.35,
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
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "3px",
                letterSpacing: "0.05em",
            },
            brandingText: {
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
            },
            footer: {
                padding: "16px 24px 24px",
                borderTop: theme === "dark" ? "1px solid #1e293b" : "1px solid #f1f5f9",
                flexShrink: 0,
                backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
            },
            inputWrapper: {
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "12px",
                border: theme === "dark" ? "1.5px solid #334155" : "1.5px solid #e2e8f0",
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                transition: "border-color 0.2s, box-shadow 0.2s",
            },
            inputWrapperFocused: {
                borderColor: primaryColor,
                boxShadow: `0 0 0 3px ${primaryColor}15`,
            },
            input: {
                backgroundColor: "transparent",
                fontSize: "14px",
                width: "100%",
                border: "none",
                outline: "none",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: theme === "dark" ? "#ffffff" : "#0f172a",
                fontFamily: "inherit",
            },
            sendButton: {
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                backgroundColor: inputValue.trim() ? primaryColor : "#cbd5e1",
                border: "none",
                cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                fontSize: "18px",
                opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
                flexShrink: 0,
            },
        };

        return (
            <div style={embeddedStyles.container}>
                {/* Header */}
                <div style={embeddedStyles.header}>
                    <div style={embeddedStyles.headerLeft}>
                        <div style={embeddedStyles.avatar}>🤖</div>
                        <div style={embeddedStyles.botInfo}>
                            <div style={embeddedStyles.botName}>{botName}</div>
                            <div style={embeddedStyles.onlineStatus}>
                                <div style={embeddedStyles.onlineDot} className="animate-pulse"></div>
                                <span style={embeddedStyles.onlineText}>Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={embeddedStyles.messagesArea}>
                    {messages.map((m, i) => (
                        m.role === "assistant" ? (
                            <div key={`${i}-${m.timestamp}`} style={embeddedStyles.messageBot}>
                                <div style={embeddedStyles.smallAvatar}>🤖</div>
                                <div style={m.isError ? embeddedStyles.messageBubbleError : embeddedStyles.messageBubbleBot}>
                                    {m.content || "(Empty message)"}
                                </div>
                            </div>
                        ) : (
                            <div key={`${i}-${m.timestamp}`} style={embeddedStyles.messageUser}>
                                <div style={embeddedStyles.messageBubbleUser}>
                                    {m.content || "(Empty message)"}
                                </div>
                            </div>
                        )
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div style={embeddedStyles.loadingIndicator}>
                            <div style={embeddedStyles.smallAvatar}>🤖</div>
                            <div style={embeddedStyles.loadingBubble}>
                                <div style={{ ...embeddedStyles.loadingDot, animationDelay: "0s" }} className="animate-pulse"></div>
                                <div style={{ ...embeddedStyles.loadingDot, animationDelay: "0.2s" }} className="animate-pulse"></div>
                                <div style={{ ...embeddedStyles.loadingDot, animationDelay: "0.4s" }} className="animate-pulse"></div>
                            </div>
                        </div>
                    )}

                    {/* Branding */}
                    <div style={embeddedStyles.branding}>
                        <div style={embeddedStyles.brandingContent}>
                            <span style={embeddedStyles.brandingBadge}>CP</span>
                            <span style={embeddedStyles.brandingText}>Powered by Chat Pilot</span>
                        </div>
                    </div>

                    {/* Invisible element for auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div style={embeddedStyles.footer}>
                    <div
                        style={{
                            ...embeddedStyles.inputWrapper,
                            ...(isFocused ? embeddedStyles.inputWrapperFocused : {})
                        }}
                    >
                        <input
                            style={embeddedStyles.input}
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && inputValue.trim() && !isLoading) {
                                    e.preventDefault();
                                    sendMessage(inputValue);
                                }
                            }}
                            disabled={isLoading}
                        />
                        <button
                            style={embeddedStyles.sendButton}
                            onClick={() => inputValue.trim() && !isLoading && sendMessage(inputValue)}
                            disabled={isLoading || !inputValue.trim()}
                            onMouseOver={(e) => {
                                if (inputValue.trim() && !isLoading) {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            {isLoading ? (
                                <div style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #ffffff",
                                    borderTopColor: "transparent",
                                    borderRadius: "50%",
                                }} className="animate-spin"></div>
                            ) : (
                                <span>➔</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Dashboard preview mode - simplified for now
    return (
        <div style={{
            padding: "24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
        }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                Widget Preview
            </div>
            <div style={{ fontSize: "14px", color: "#64748b" }}>
                This widget will appear on your website when embedded
            </div>
        </div>
    );
}

export default function WidgetChat() {
    return (
        <Suspense fallback={
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "#64748b",
                flexDirection: "column",
                gap: "16px"
            }}>
                <div style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #e2e8f0",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                }}></div>
                <div>Loading...</div>
            </div>
        }>
            <WidgetChatContent />
        </Suspense>
    );
}