import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Bot, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { BotWithRelations } from "@/lib/types";
import { LiquidMetalButton } from "@/components/liquid-metal-button";

// Circular Progress Component
const CircularProgress: React.FC<{
    progress: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}> = ({ progress, size = 80, strokeWidth = 6, className = "" }) => {
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

// Bot Card Component
const BotCard: React.FC<{
    bot: BotWithRelations;
    isSelected: boolean;
    isConfigured: boolean;
    progress: number;
    checks: any[];
    onSelect: () => void;
}> = ({ bot, isSelected, isConfigured, progress, checks, onSelect }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const nameClass =
        "mt-2 max-w-[108px] truncate text-center text-xs font-medium tracking-tight transition-colors " +
        (isSelected
            ? "text-slate-900"
            : isConfigured
                ? "text-slate-800"
                : "text-slate-500");

    return (
        <div className="relative flex flex-col items-center">

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
                        "group relative flex h-[92px] w-[92px] items-center justify-center bg-transparent" +
                        (!isConfigured ? " opacity-70" : "")
                    }
                >
                    {/* Selected halo */}
                    {isSelected && (
                        <div className="pointer-events-none absolute inset-0 rounded-full bg-slate-900/5 blur-md" />
                    )}

                    {/* Circular Progress with Icon */}
                    <div className="relative">
                        <CircularProgress progress={progress} size={80} strokeWidth={6} />

                        {/* Center Icon */}
                        <div
                            className={
                                "absolute left-[6px] top-[6px] flex h-[68px] w-[68px] items-center justify-center rounded-full border transition-colors " +
                                (isSelected
                                    ? "border-slate-900/5 bg-slate-900 text-white"
                                    : isConfigured
                                        ? "border-slate-200/70 bg-white group-hover:border-slate-300/70"
                                        : "border-slate-200/70 bg-slate-50")
                            }
                        >
                            {bot.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={bot.avatar_url}
                                    alt=""
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                            ) : (
                                <Bot
                                    className={
                                        "h-8 w-8 transition-colors " +
                                        (isSelected
                                            ? "text-white"
                                            : isConfigured
                                                ? "text-slate-700"
                                                : "text-slate-400")
                                    }
                                />
                            )}
                        </div>

                        {/* Active Indicator */}
                        {isSelected && (
                            <>
                                <motion.div
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500/80 shadow-[0_6px_16px_rgba(16,185,129,0.18)]"
                                >
                                    <motion.div
                                        className="h-2 w-2 rounded-full bg-white"
                                        animate={{ opacity: [0.75, 1, 0.75] }}
                                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </motion.div>
                                <motion.div
                                    className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-emerald-500/30"
                                    animate={{ scale: [1, 1.6, 1.6], opacity: [0.35, 0, 0] }}
                                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </>
                        )}

                    {/* Config Error Indicator */}
                    {!isConfigured && (
                        <Link
                            href={`/dashboard/agents`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500/85 shadow-[0_6px_16px_rgba(244,63,94,0.18)] transition-colors hover:bg-rose-500"
                        >
                            <AlertCircle className="h-3.5 w-3.5 text-white" />
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

// Main Component Usage Example
const BotSelector: React.FC<{
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {bots.map((bot) => {
                    const checks = getBotConfigChecks(bot);
                    const progress = getConfigProgress(checks);
                    const configured = isBotFullyConfigured(bot);

                    return (
                        <BotCard
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
        );
    };

export default BotSelector;
