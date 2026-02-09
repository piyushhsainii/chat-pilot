import React from 'react'
import Reveal from './Reveal'
import PrimaryCTA from "@/landing/PrimaryCTA";
import LaserFlow from '@/components/LaserFlow';

const Hero2 = () => {
    return (
        <section className="relative overflow-hidden pt-20  sm:pt-28 ">
            {/* Background gradients */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50" />
                <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_15%,rgba(56,189,248,0.20),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_85%,rgba(99,102,241,0.14),transparent_60%)]" />
            </div>

            <div className='max-w-7xl mx-auto px-6 lg:px-8'>
                <div className="relative">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left column - Content */}
                        <Reveal className="flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 backdrop-blur-sm px-3 py-1.5 text-xs text-zinc-800 tracking-tight w-fit shadow-sm">
                                <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-semibold">Try for Free</span>
                            </div>

                            <h1 className="mt-8 max-w-[18ch] font-sans font-normal text-balance tracking-tighter text-5xl leading-[1.08] sm:text-6xl lg:text-7xl text-zinc-900">
                                AI agents for magical customer experiences
                            </h1>

                            <p className="mt-6 max-w-[52ch] tracking-tight text-pretty text-lg sm:text-xl leading-relaxed text-zinc-600">
                                Build, train and deploy custom AI support agents that solve customer
                                problems instantly, 24/7. No coding required.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <PrimaryCTA
                                    className="group relative border-2 border-zinc-900 bg-zinc-900 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200/50 active:scale-[0.98] inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-bold overflow-hidden"
                                    textBuild="Build your agent"
                                    textWaitlist="Join waitlist"
                                    buildChildren={
                                        <>
                                            <span className="relative z-10 ">Build your agent</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </>
                                    }
                                    waitlistChildren={
                                        <>
                                            <span className="relative z-10">Join waitlist</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </>
                                    }
                                />
                                {/* <a
                                    href="#"
                                    className="border-2 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 hover:shadow-lg inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-bold text-zinc-900"
                                >
                                    Book Demo
                                </a> */}
                            </div>
                        </Reveal>

                        {/* Right column - Video Asset */}
                        <Reveal delayMs={120} className="flex items-center justify-center lg:justify-end">
                            <div className="relative w-full  " >
                                {/* Decorative elements */}
                                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/40 via-indigo-100/40 to-purple-100/40 rounded-[2.5rem] blur-2xl opacity-60" />
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />

                                {/* Your content here */}
                                {/* Video container */}
                                <div className="relative z-10  w-full rounded-3xl  border-2 border-zinc-200/80 bg-white/90 backdrop-blur-sm p-3 shadow-2xl shadow-zinc-900/10">
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/50">
                                        <img src="/Hero-final-illustration.png" alt="" className=" aspect-video w-[1200px]  object-contain" />
                                        {/* Overlay gradient */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-900/5 via-transparent to-transparent" />
                                    </div>
                                </div>

                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>

            {/* Bottom divider */}
            <div className="mt-20 sm:mt-28 border-t border-zinc-200" />
        </section>
    )
}

export default Hero2


function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                {value}
            </div>
            <div className="mt-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
}
