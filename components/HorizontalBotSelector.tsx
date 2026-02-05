import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, AlertCircle, CheckCircle2, Settings } from "lucide-react";

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
                className="text-slate-200"
            />
            {/* Progress circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`transition-all duration-500 ${progress === 100
                        ? "text-emerald-500"
                        : progress >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                    }`}
                style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                }}
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

    return (
        <div className="relative snap-start flex-shrink-0">
            <motion.button
                disabled={!isConfigured}
                onClick={onSelect}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                whileHover={isConfigured ? { y: -4 } : undefined}
                whileTap={isConfigured ? { scale: 0.95 } : undefined}
                className={`
          relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all
          min-w-[90px] max-w-[90px]
          ${!isConfigured
                        ? "cursor-not-allowed opacity-60"
                        : isSelected
                            ? "bg-indigo-50/50"
                            : "bg-transparent hover:bg-slate-50"
                    }
        `}
            >
                {/* Circular Progress with Icon */}
                <div className="relative">
                    <CircularProgress progress={progress} size={64} strokeWidth={5} />

                    {/* Center Icon */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center rounded-full transition-all ${isSelected
                                ? "bg-indigo-500 shadow-lg shadow-indigo-200"
                                : isConfigured
                                    ? "bg-white border-2 border-slate-200"
                                    : "bg-red-50 border-2 border-red-200"
                            }`}
                        style={{
                            width: 54,
                            height: 54,
                            top: 5,
                            left: 5,
                        }}
                    >
                        <Bot
                            className={`h-6 w-6 transition-colors ${isSelected
                                    ? "text-white"
                                    : isConfigured
                                        ? "text-slate-600"
                                        : "text-red-400"
                                }`}
                        />
                    </div>

                    {/* Active Indicator Pulse */}
                    {isSelected && (
                        <>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center"
                            >
                                <div className="h-2 w-2 rounded-full bg-white" />
                            </motion.div>

                            {/* Pulse effect */}
                            <motion.div
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0, 0.5],
                                }}
                                transition={{
                                    duration: 2,
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
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        >
                            <AlertCircle className="h-3 w-3 text-white" />
                        </Link>
                    )}
                </div>

                {/* Bot Name */}
                <div className="text-center w-full">
                    <p
                        className={`text-[11px] font-bold truncate max-w-[85px] transition-colors ${isSelected
                                ? "text-indigo-600"
                                : isConfigured
                                    ? "text-slate-800"
                                    : "text-slate-500"
                            }`}
                        title={bot.name}
                    >
                        {bot.name}
                    </p>
                </div>

                {/* Progress Badge */}
                <div
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap ${progress === 100
                            ? "bg-emerald-100 text-emerald-700"
                            : progress >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                        }`}
                >
                    {progress}%
                </div>
            </motion.button>

            {/* Tooltip */}
            {showTooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 pointer-events-none"
                >
                    <div className="bg-white rounded-xl border-2 border-slate-200 shadow-xl p-4">
                        {/* Bot Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <div
                                className={`p-2 rounded-lg ${isConfigured ? "bg-emerald-50" : "bg-red-50"
                                    }`}
                            >
                                {isConfigured ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {bot.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {isConfigured ? "Ready to use" : "Needs configuration"}
                                </p>
                            </div>
                        </div>

                        {/* Tone Badge */}
                        <div className="mb-3">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase">
                                {bot.tone}
                            </span>
                        </div>

                        {/* Configuration Status */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Configuration</span>
                                <span
                                    className={`font-bold ${progress === 100
                                            ? "text-emerald-600"
                                            : progress >= 50
                                                ? "text-amber-600"
                                                : "text-red-600"
                                        }`}
                                >
                                    {progress}% Complete
                                </span>
                            </div>

                            {/* Progress Items */}
                            <div className="space-y-1.5">
                                {checks.map((check) => (
                                    <div
                                        key={check.label}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <div
                                            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${check.valid ? "bg-emerald-500" : "bg-red-400"
                                                }`}
                                        />
                                        <span
                                            className={
                                                check.valid ? "text-slate-600" : "text-red-600 font-medium"
                                            }
                                        >
                                            {check.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Link */}
                            {!isConfigured && (
                                <Link
                                    href={`/dashboard/bots/${bot.id}/config`}
                                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    <span>Fix Configuration →</span>
                                </Link>
                            )}
                        </div>

                        {/* Active Indicator in Tooltip */}
                        {isSelected && (
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-semibold text-emerald-600">
                                    Currently Active
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
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