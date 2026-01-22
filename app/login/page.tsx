"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";

// Configuration: Toggle testimonials carousel here
const SHOW_TESTIMONIALS = true;

interface LoginProps {
  onBack: () => void;
}

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

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();
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

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px]"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl h-full flex flex-col md:flex-row bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-fade-in relative z-10">
        {/* Left Side: Auth */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div>
            <button
              onClick={() => {
                router.push("/");
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-medium transition-colors group mb-12 cursor-pointer "
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform hover:border rounded-full px-2 py-1 border-black/15">
                ←
              </span>
            </button>

            <div className="mb-10">
              <img
                src="/logo2.png"
                alt="Chatbase"
                className="w-12 h-12 object-contain mb-6"
              />
              <h1 className="text-4xl text-slate-900 font-normal mb-4 tracking-tighter">
                Log in
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xs tracking-tight">
                Welcome back! Sign in to continue building your custom AI
                agents.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-800 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                    alt="Google"
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                  />
                )}
                <span>Sign in with Google</span>
              </button>
              <p className="text-center text-slate-400 text-xs mt-4">
                By signing in, you agree to our{" "}
                <a href="#" className="underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-20">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <button className="text-indigo-600 font-bold hover:underline">
                Create for free
              </button>
            </p>
          </div>
        </div>

        {/* Right Side: Media & Testimonials */}
        <div className="w-full md:w-1/2 bg-slate-50/50 p-10 md:p-16 flex flex-col justify-center items-center">
          <div className="w-full max-w-md">
            {/* Visual Component */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-12 animate-float">
              <img
                src="https://picsum.photos/seed/dashboard/800/600"
                alt="Platform Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
              {/* Play button overlay representation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/30 backdrop-blur rounded-full flex items-center justify-center border border-white/40">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>

            {/* Testimonials Carousel (Toggleable) */}
            {SHOW_TESTIMONIALS && (
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V10C13.017 8.89543 13.9124 8 15.017 8H19.017C20.1216 8 21.017 8.89543 21.017 10V18C21.017 19.6569 19.6739 21 18.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017V14H4.017C2.91243 14 2.017 13.1046 2.017 12V10C2.017 8.89543 2.91243 8 4.017 8H8.017C9.12157 8 10.017 8.89543 10.017 10V18C10.017 19.6569 8.67386 21 7.017 21H3.017Z" />
                  </svg>
                </div>

                <div className="relative h-24">
                  {testimonials.map((t, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-all duration-1000 transform ${i === currentTestimonial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                    >
                      <p className="text-slate-700 font-medium italic leading-relaxed">
                        "{t.quote}"
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {testimonials.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? "bg-indigo-600 w-4" : "bg-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating help / links */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">
        <a href="#" className="hover:text-slate-900 transition-colors">
          Help
        </a>
        <a href="#" className="hover:text-slate-900 transition-colors">
          Privacy
        </a>
        <a href="#" className="hover:text-slate-900 transition-colors">
          Terms
        </a>
      </div>
    </div>
  );
};

export default Login;
