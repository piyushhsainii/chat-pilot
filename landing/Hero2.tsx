import React from 'react'
import Reveal from './Reveal'

const Hero2 = () => {
    return (
        <section className="relative overflow-hidden pt-16 sm:pt-20 mx-auto h-[65vh]">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50" />
                <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_15%,rgba(56,189,248,0.20),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_85%,rgba(99,102,241,0.14),transparent_60%)]" />
            </div>
            <div className=' max-w-7xl mx-auto'>
                <div className="containerX relative">
                    <div className="flex items-center justify-center gap-10 ">
                        <Reveal className="">
                            <div className="inline-flex items-center gap-2 rounded-full border hairline bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs text-black tracking-tight">
                                <span className="inline-block size-1.5 rounded-full bg-[var(--brand)]" />
                                <span>Try for Free</span>
                            </div>

                            <h1 className="mt-6 max-w-[16ch] font-medium text-balance tracking-tighter text-5xl  leading-[1.02]  sm:text-6xl">
                                AI agents for magical customer experiences
                            </h1>
                            <p className="mt-5 max-w-[52ch] text-pretty  text-lg leading-8 text-black tracking-tight">
                                Build, train and deploy custom AI support agents that solve customer
                                problems instantly, 24/7. No coding required.
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <a
                                    href="/dashboard"
                                    className=" border border-black/50 bg-black text-white transition-all duration-150 hover:scale-110 hover:shadow-md hover:shadow-blue-300 inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                                >
                                    Build your agent
                                </a>
                                <a
                                    href="#"
                                    className="buttonSecondary hover:border inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
                                >
                                    Book Demo
                                </a>
                            </div>

                            {/* <div className="mt-10 grid max-w-[560px] grid-cols-3 gap-4 rounded-2xl border hairline bg-[rgba(255,255,255,0.02)] p-4">
                                <Metric label="Businesses" value="10,000+" />
                                <Metric label="Countries" value="140+" />
                                <Metric label="Setup" value="5 min" />
                            </div> */}
                        </Reveal>

                        <Reveal delayMs={120} className="h-full">

                            <div className="relative flex max-w-xl ml-20 items-center mx-auto rounded-3xl border border-zinc-900/10 bg-white/80 p-2 shadow-[0_40px_120px_-60px_rgba(24,24,27,0.25)]">
                                <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-zinc-900/10">
                                    <video
                                        src="/chat-pilot-initial-walkthrough.mp4"
                                        controls
                                        muted
                                        autoPlay
                                        className="w-full h-full object-contain opacity-95 contrast-110"
                                    />
                                    <div className="pointer-events-none absolute h-full inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
            <div className="mt-14 border-t hairline" />
        </section>
    )
}

export default Hero2


function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border hairline bg-[rgba(255,255,255,0.02)] p-4">
            <div className="text-xs text-gray-800">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-[-0.02em]">
                {value}
            </div>
        </div>
    );
}

