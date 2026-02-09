"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";

// Configuration: Toggle testimonials carousel here
const SHOW_TESTIMONIALS = true;

const testimonials = [
  {
    quote:
      "Chatbase has saved us 100+ hours of support every single month. It's magic.",
    author: "Sarah Chen",
    role: "Product at TechScale",
  },
  {
    quote:
      "The setup was truly 5 minutes. Now our customers get answers instantly.",
    author: "James Miller",
    role: "Founder of ShopFlow",
  },
  {
    quote: "Best AI tool we've integrated this year. Period.",
    author: "Elena Rossi",
    role: "Ops Lead at GlobalOps",
  },
];

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();

  const accent = useMemo(() => {
    // Muted, confidence-building accent (single accent color).
    return {
      "--accent": "#0f766e", // teal-700
      "--accentSoft": "rgba(15, 118, 110, 0.12)",
    } as React.CSSProperties;
  }, []);

  // Carousel logic
  useEffect(() => {
    if (!SHOW_TESTIMONIALS) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      console.log("Supabase login initiated:", data);
    } catch (err: any) {
      console.error("Login error:", err.message);
      // Fallback for visual demo purposes
      setTimeout(() => {
        alert(
          "Supabase login initiated (Mock)! In a real project, configure your URL and Key.",
        );
        setIsLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const isAlreadyLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) window.location.href = "/";
    };

    isAlreadyLoggedIn();
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#f6f6f4] text-slate-900 font-sans antialiased flex items-center justify-center px-4 py-10 md:py-14"
      style={accent}
    >
      <div className="w-full max-w-6xl">
        <div className="grid overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_18px_40px_rgba(15,23,42,0.08)] md:grid-cols-2 md:min-h-[680px]">
          {/* Left: Auth */}
          <div className="px-8 py-10 md:px-14 md:py-14 flex flex-col">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accentSoft)]"
              >
                <span aria-hidden className="text-base">
                  ←
                </span>
                Back
              </button>
              <a
                href="/"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200"
              >
                Home
              </a>
            </div>

            <div className="flex-1 flex flex-col justify-center py-10 md:py-12">
              <img
                src="/chat-pilot-logo.png"
                alt="Chatbase"
                className="h-10 w-10 object-contain"
              />

              <h1 className="mt-6 text-3xl md:text-[2.15rem] leading-tight font-medium tracking-tight">
                Sign in
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600 max-w-sm">
                Welcome back. Continue to your workspace in a moment.
              </p>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full group inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-[15px] font-medium text-slate-900 shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--accentSoft)]"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-[color:var(--accent)]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="Loading"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt=""
                      className="h-5 w-5 transition-transform duration-200 group-hover:scale-[1.06]"
                    />
                  )}
                  <span>Sign in with Google</span>
                </button>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">New here?</span>
                  <a
                    href="/onboarding"
                    className="text-[color:var(--accent)] hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Create account
                  </a>
                </div>

                <p className="pt-3 text-xs leading-relaxed text-slate-500">
                  By continuing, you agree to our{" "}
                  <a
                    href="/terms-of-service"
                    className="text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Terms
                  </a>
                  {" "}and{" "}
                  <a
                    href="/privacy-policy"
                    className="text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Right: Illustration + Testimonial */}
          <div className="bg-[#fbfbfa] border-t border-slate-200/60 md:border-t-0 md:border-l md:pl-0">
            <div className="h-full px-8 py-10 md:px-14 md:py-14 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-3xl overflow-hidden border border-slate-200/70 bg-white shadow-sm">
                  <img
                    src="/Hero-final-illustration.png"
                    alt="Product preview"
                    className="w-full h-auto object-cover opacity-[0.92] saturate-75 contrast-90"
                  />
                </div>

                {SHOW_TESTIMONIALS && (
                  <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
                  <div className="flex items-start justify-between gap-6">
                      <div className="text-slate-200 leading-none select-none" aria-hidden>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V10C13.017 8.89543 13.9124 8 15.017 8H19.017C20.1216 8 21.017 8.89543 21.017 10V18C21.017 19.6569 19.6739 21 18.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017V14H4.017C2.91243 14 2.017 13.1046 2.017 12V10C2.017 8.89543 2.91243 8 4.017 8H8.017C9.12157 8 10.017 8.89543 10.017 10V18C10.017 19.6569 8.67386 21 7.017 21H3.017Z" />
                        </svg>
                      </div>

                      <div className="relative min-h-[88px] flex-1">
                        {testimonials.map((t, i) => (
                          <div
                            key={i}
                            className={`absolute inset-0 transition-opacity duration-200 ${i === currentTestimonial ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                          >
                            <p className="text-[15px] leading-relaxed text-slate-700">
                              {t.quote}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {testimonials[currentTestimonial].author}
                        </div>
                        <div className="text-xs text-slate-500">
                          {testimonials[currentTestimonial].role}
                        </div>
                      </div>
                      <div className="flex gap-1.5" aria-label="Testimonial pagination">
                        {testimonials.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-200 ${i === currentTestimonial ? "w-5 bg-[color:var(--accent)]" : "w-1.5 bg-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
                  <a
                    href="#"
                    className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Help
                  </a>
                  <a
                    href="/privacy-policy"
                    className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Privacy
                  </a>
                  <a
                    href="/terms-of-service"
                    className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
