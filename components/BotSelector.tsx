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
}> = ({ progress, size = 80, strokeWidth = 6, className = "" }) => {
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

// Bot Card Component
const BotCard: React.FC<{
    bot: any;
    isSelected: boolean;
    isConfigured: boolean;
    progress: number;
    checks: any[];
    onSelect: () => void;
}> = ({ bot, isSelected, isConfigured, progress, checks, onSelect }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <motion.button
                disabled={!isConfigured}
                onClick={onSelect}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                whileHover={isConfigured ? { scale: 1.05 } : undefined}
                whileTap={isConfigured ? { scale: 0.95 } : undefined}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${!isConfigured
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
            >
                {/* Circular Progress with Icon */}
                <div className="relative">
                    <CircularProgress progress={progress} size={80} strokeWidth={6} />

                    {/* Center Icon */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center rounded-full transition-all ${isSelected
                                ? "bg-indigo-500 shadow-lg shadow-indigo-200"
                                : isConfigured
                                    ? "bg-slate-100 group-hover:bg-slate-200"
                                    : "bg-red-50"
                            }`}
                        style={{
                            width: 68,
                            height: 68,
                            top: 6,
                            left: 6,
                        }}
                    >
                        <Bot
                            className={`h-8 w-8 transition-colors ${isSelected
                                    ? "text-white"
                                    : isConfigured
                                        ? "text-slate-600"
                                        : "text-red-400"
                                }`}
                        />
                    </div>

                    {/* Active Indicator */}
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-3 border-white shadow-lg flex items-center justify-center"
                        >
                            <div className="h-2 w-2 rounded-full bg-white" />
                        </motion.div>
                    )}

                    {/* Config Error Indicator */}
                    {!isConfigured && (
                        <Link
                            href={`/dashboard/bots/${bot.id}/config`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 border-3 border-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors group/error"
                        >
                            <AlertCircle className="h-3.5 w-3.5 text-white" />
                        </Link>
                    )}

                    {/* Progress Percentage */}
                    <div
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black ${progress === 100
                                ? "bg-emerald-100 text-emerald-700"
                                : progress >= 50
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                    >
                        {progress}%
                    </div>
                </div>

                {/* Bot Name */}
                <div className="text-center w-full">
                    <p
                        className={`text-xs font-bold truncate max-w-[100px] transition-colors ${isSelected
                                ? "text-indigo-600"
                                : isConfigured
                                    ? "text-slate-800"
                                    : "text-slate-500"
                            }`}
                        title={bot.name}
                    >
                        {bot.name}
                    </p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase mt-1 inline-block">
                        {bot.tone}
                    </span>
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
                                            className={`h-1.5 w-1.5 rounded-full ${check.valid ? "bg-emerald-500" : "bg-red-400"
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