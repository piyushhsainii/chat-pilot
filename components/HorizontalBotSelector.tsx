import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Bot, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { LiquidMetalButton } from "@/components/liquid-metal-button";

// Circular Progress Component
const CircularProgress: React.FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}> = ({ progress, size = 64, strokeWidth = 5, className = "" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const ringClass =
        progress === 100
            ? "text-emerald-500/80"
            : progress >= 50
                ? "text-amber-500/75"
                : "text-rose-500/60";

    return (
        <svg width={size} height={size} className={className}>
            {/* Background circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200/80"
            />
            {/* Progress circle */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                initial={false}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                className={
                    "-rotate-90 origin-center opacity-80 transition-opacity duration-300 group-hover:opacity-100 " +
                    ringClass +
                    (progress === 100
                        ? " drop-shadow-[0_0_6px_rgba(16,185,129,0.18)]"
                        : "")
                }
            />
        </svg>
    );
};

// Compact Bot Card for Horizontal Scroll
const CompactBotCard: React.FC<{
    bot: any;
    isSelected: boolean;
    isConfigured: boolean;
    progress: number;
    checks: any[];
    onSelect: () => void;
}> = ({ bot, isSelected, isConfigured, progress, checks, onSelect }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    const avatarUrl = (bot as any)?.avatar_url as string | null | undefined;
    const showAvatar = Boolean(avatarUrl && String(avatarUrl).trim()) && !avatarFailed;

    useEffect(() => {
        setAvatarFailed(false);
    }, [avatarUrl]);

    const nameClass =
        "mt-1 max-w-[86px] truncate text-center text-[11px] font-medium tracking-tight transition-colors " +
        (isSelected
            ? "text-slate-900"
            : isConfigured
                ? "text-slate-800"
                : "text-slate-500");

    return (
        <div className="relative snap-start flex-shrink-0 flex flex-col items-center">

            <motion.div
                whileHover={isConfigured ? { scale: 1.03 } : undefined}
                whileTap={isConfigured ? { scale: 0.985 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.35 }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <LiquidMetalButton
                    variant="surface"
                    disabled={!isConfigured}
                    active={isSelected}
                    onClick={onSelect}
                    surfaceRadiusClassName="rounded-full"
                    className={
                        "group relative flex h-[76px] w-[76px] items-center justify-center bg-transparent" +
                        (!isConfigured ? " opacity-70" : "")
                    }
                >
                    {isSelected && (
                        <div className="pointer-events-none absolute inset-0 rounded-full bg-slate-900/5 blur-md" />
                    )}

                    {/* Circular Progress with Icon */}
                    <div className="relative">
                        <CircularProgress progress={progress} size={64} strokeWidth={5} />

                    {/* Center Icon */}
                    <div
                        className={
                            "absolute left-[5px] top-[5px] flex h-[54px] w-[54px] items-center justify-center rounded-full border transition-colors " +
                            (isSelected
                                ? "border-slate-900/5 bg-slate-900 text-white"
                                : isConfigured
                                    ? "border-slate-200/70 bg-white group-hover:border-slate-300/70"
                                    : "border-slate-200/70 bg-slate-50")
                        }
                    >
                        {showAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={String(avatarUrl)}
                                alt={bot.name ? String(bot.name) : "Bot avatar"}
                                className={`h-9 w-9 rounded-full object-cover ${isSelected ? "ring-2 ring-white/30" : ""}`}
                                onError={(e) => {
                                    setAvatarFailed(true);
                                }}
                            />
                        ) : (
                            <Bot
                                className={`h-6 w-6 transition-colors ${isSelected
                                        ? "text-white"
                                        : isConfigured
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                    }`}
                            />
                        )}
                    </div>

                    {/* Active Indicator Pulse */}
                    {isSelected && (
                        <>
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500/80 shadow-[0_6px_16px_rgba(16,185,129,0.18)]"
                            >
                                <motion.div
                                    className="h-2 w-2 rounded-full bg-white"
                                    animate={{ opacity: [0.75, 1, 0.75] }}
                                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </motion.div>

                            {/* Pulse effect */}
                            <motion.div
                                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-emerald-500/30"
                                animate={{
                                    scale: [1, 1.6, 1.6],
                                    opacity: [0.35, 0, 0],
                                }}
                                transition={{
                                    duration: 3.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </>
                    )}

                    {/* Config Error Indicator */}
                    {!isConfigured && (
                        <Link
                            href={`/dashboard/bots/${bot.id}/config`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500/85 shadow-[0_6px_16px_rgba(244,63,94,0.18)] transition-colors hover:bg-rose-500"
                        >
                            <AlertCircle className="h-3 w-3 text-white" />
                        </Link>
                    )}
                    </div>
                </LiquidMetalButton>
            </motion.div>

            {/* Bot Name */}
            <p className={nameClass} title={bot.name}>
                {bot.name}
            </p>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 pointer-events-none"
                    >
                        <div className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                        {/* Bot Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className={
                                    "flex h-9 w-9 items-center justify-center rounded-xl border " +
                                    (isConfigured
                                        ? "border-emerald-200/60 bg-emerald-50/70"
                                        : "border-rose-200/60 bg-rose-50/70")
                                }
                            >
                                {isConfigured ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600/80" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-rose-600/80" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">
                                    {bot.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {isConfigured ? "Ready to use" : "Needs configuration"}
                                </p>
                            </div>
                        </div>

                        {/* Tone Badge */}
                        <div className="mb-3">
                            <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-100/60 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-600">
                                {bot.tone}
                            </span>
                        </div>

                        {/* Action Link */}
                        {!isConfigured && (
                            <Link
                                href={`/dashboard/bots/${bot.id}/config`}
                                className="pointer-events-auto mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-400"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Settings className="h-3.5 w-3.5 text-slate-700" />
                                <span>Configure bot</span>
                            </Link>
                        )}

                        {/* Active Indicator in Tooltip */}
                        {isSelected && (
                            <div className="mt-3 flex items-center gap-2 border-t border-slate-100/70 pt-3">
                                <motion.div
                                    className="h-2 w-2 rounded-full bg-emerald-500/80"
                                    animate={{ opacity: [0.55, 1, 0.55] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <span className="text-xs font-medium text-emerald-700">
                                    Currently Active
                                </span>
                            </div>
                        )}
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main Horizontal Scroll Component
const HorizontalBotSelector: React.FC<{
    bots: any[];
    selectedBotId: string | null;
    setSelectedBotId: (id: string) => void;
    getBotConfigChecks: (bot: any) => any[];
    getConfigProgress: (checks: any[]) => number;
    isBotFullyConfigured: (bot: any) => boolean;
}> = ({
    bots,
    selectedBotId,
    setSelectedBotId,
    getBotConfigChecks,
    getConfigProgress,
    isBotFullyConfigured,
}) => {
        return (
            <div className="relative">
                {/* Scroll container */}
                <div
                    className="
          flex gap-2 px-4 py-4
          overflow-x-auto overflow-y-hidden
          snap-x snap-mandatory
          scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent
          hover:scrollbar-thumb-slate-400
        "
                >
                    {bots.map((bot) => {
                        const checks = getBotConfigChecks(bot);
                        const progress = getConfigProgress(checks);
                        const configured = isBotFullyConfigured(bot);

                        return (
                            <CompactBotCard
                                key={bot.id}
                                bot={bot}
                                isSelected={selectedBotId === bot.id}
                                isConfigured={configured}
                                progress={progress}
                                checks={checks}
                                onSelect={() => configured && setSelectedBotId(bot.id)}
                            />
                        );
                    })}
                </div>

                {/* Scroll fade indicators */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent" />

                {/* Optional: Scroll hint on mobile */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 3, duration: 1 }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none md:hidden"
                >
                    <div className="bg-slate-800 text-white text-[10px] px-3 py-1 rounded-full font-semibold shadow-lg">
                        ← Swipe to see more →
                    </div>
                </motion.div>
            </div>
        );
    };

export default HorizontalBotSelector;
