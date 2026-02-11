import Navbar from "@/landing/Navbar";
import Footer from "@/landing/Footer";
import { legalContent } from "@/lib/static-data";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative">
      {/* <Navbar scrolled={true} /> */}

      <main className="relative pt-24 sm:pt-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50" />
          <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_15%,rgba(56,189,248,0.20),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_85%,rgba(99,102,241,0.14),transparent_60%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 pb-20">
          <div className="rounded-3xl border border-zinc-200/80 bg-white/80 backdrop-blur-sm shadow-xl shadow-zinc-900/5 p-7 sm:p-10">
            <div
              className="prose prose-zinc max-w-none prose-h2:tracking-tight prose-h2:text-zinc-900 prose-h3:tracking-tight prose-a:text-zinc-900 prose-a:underline-offset-4"
              dangerouslySetInnerHTML={{ __html: legalContent.privacyPolicyHtml }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
