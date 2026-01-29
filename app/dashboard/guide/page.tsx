import Link from "next/link";

type TocItem = {
  id: string;
  label: string;
};

const toc: TocItem[] = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quickstart" },
  { id: "configure", label: "Configure Your Bot" },
  { id: "knowledge", label: "Add Knowledge" },
  { id: "test", label: "Test in Playground" },
  { id: "deploy", label: "Deploy the Widget" },
  { id: "domains", label: "Allowed Domains" },
  { id: "limits", label: "Rate Limits" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "faq", label: "FAQ" },
];

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4">
        {eyebrow ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Callout({
  tone,
  title,
  children,
}: {
  tone: "info" | "warn";
  title: string;
  children: React.ReactNode;
}) {
  const cls =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-800";

  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="font-bold text-sm mb-1">{title}</div>
      <div className="text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {language ?? "code"}
        </span>
      </div>
      <pre className="p-4 overflow-x-auto text-xs text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <header className="mb-6 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Documentation
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
              Agent Setup Guide
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              A practical walkthrough to configure your bot, attach knowledge,
              and deploy the widget.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard/agents"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Go to Agents
            </Link>
            <Link
              href="/dashboard/knowledge"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Add Knowledge
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Step 1
              </div>
              <div className="mt-1 font-bold text-slate-900">Configure bot</div>
              <div className="mt-1 text-sm text-slate-600">
                Name, tone, fallback, system prompt.
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Step 2
              </div>
              <div className="mt-1 font-bold text-slate-900">Add knowledge</div>
              <div className="mt-1 text-sm text-slate-600">
                Upload docs / paste text into Knowledge Manager.
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Step 3
              </div>
              <div className="mt-1 font-bold text-slate-900">Deploy</div>
              <div className="mt-1 text-sm text-slate-600">
                Set domains and embed the widget.
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr] flex-1 overflow-hidden">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              On this page
            </div>
            <nav className="space-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="space-y-10 overflow-y-auto pr-2">
          <Section id="overview" title="Overview" eyebrow="Start here">
            <p>
              Your bot’s behavior is driven by two things:
              <strong> configuration</strong> (system prompt, tone, fallback) and
              <strong> knowledge</strong> (the docs you upload or paste).
            </p>
            <Callout tone="info" title="How answers are generated">
              The chat API combines your bot’s system prompt from the
              <code className="font-mono"> bots</code> table with your knowledge
              document URLs from <code className="font-mono">knowledge_sources</code>.
            </Callout>
          </Section>

          <Section id="quickstart" title="Quickstart" eyebrow="5 minutes">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="font-bold text-slate-900">Checklist</div>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>
                        Create a bot in <Link href="/dashboard/agents" className="text-indigo-600 font-semibold hover:underline">Agents</Link>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>
                        Open <span className="font-semibold">Settings</span> on the bot card and fill: name, tone, fallback, system prompt
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>
                        Upload docs or paste text in <Link href="/dashboard/knowledge" className="text-indigo-600 font-semibold hover:underline">Knowledge Base</Link>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>
                        Test in <Link href="/dashboard" className="text-indigo-600 font-semibold hover:underline">Playground</Link>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>
                        Deploy via <Link href="/dashboard/deploy" className="text-indigo-600 font-semibold hover:underline">Deploy</Link> and set allowed domains
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900">Recommended prompt style</div>
                  <p className="mt-2 text-sm text-slate-600">
                    Keep it clear and operational: who the bot is, what it can do, what to avoid.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      language="System prompt"
                      code={`You are a customer support assistant.\n\n- Be concise and accurate.\n- Ask a clarifying question when needed.\n- If you cannot find the answer in the provided knowledge, use the fallback message.`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="configure" title="Configure Your Bot" eyebrow="Agents">
            <p>
              Go to <Link href="/dashboard/agents" className="text-indigo-600 font-semibold hover:underline">Agents</Link> and open the
              <span className="font-semibold"> settings</span> icon on a bot card.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="font-bold text-slate-900">Bot fields</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-semibold">Name</span>: what your team sees.
                    </div>
                    <div>
                      <span className="font-semibold">Tone</span>: professional / friendly / casual.
                    </div>
                    <div>
                      <span className="font-semibold">Fallback behavior</span>: what to say when knowledge is missing.
                    </div>
                    <div>
                      <span className="font-semibold">System prompt</span>: the operating instructions for the bot.
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Bot settings</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="font-semibold">Rate limit</span>: requests per window.
                    </div>
                    <div>
                      <span className="font-semibold">Allowed domains</span>: where the widget is allowed to run.
                    </div>
                    <div>
                      <span className="font-semibold">Rate limit hit message</span>: message shown when users exceed limits.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="knowledge" title="Add Knowledge" eyebrow="Knowledge Base">
            <p>
              Knowledge sources are stored per bot. When you upload a document or
              paste raw text, it’s uploaded to storage, a public URL is generated,
              and the URL is stored in <code className="font-mono">knowledge_sources.doc_url</code>.
            </p>
            <Callout tone="warn" title="PDF notes">
              PDFs are stored and referenced by URL. If you want the bot to
              “read” PDFs directly, you’ll need an indexing pipeline that
              extracts text and marks the source as indexed.
            </Callout>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="font-bold text-slate-900">Best practices</div>
              <div className="mt-2 space-y-2">
                <div>• Keep documents focused (one topic per doc).</div>
                <div>• Prefer plain text for critical instructions.</div>
                <div>• Update docs when policies change.</div>
              </div>
            </div>
          </Section>

          <Section id="test" title="Test in Playground" eyebrow="Dashboard">
            <p>
              Use the Playground to validate responses before you deploy. Test
              “easy” questions and edge cases (refunds, cancellations, account
              issues).
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="font-bold text-slate-900">Suggested test set</div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  “What is your refund policy?”
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  “How do I change my billing email?”
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  “I forgot my password.”
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  “I’m seeing an error code 403.”
                </div>
              </div>
            </div>
          </Section>

          <Section id="deploy" title="Deploy the Widget" eyebrow="Embed">
            <p>
              Deploy from <Link href="/dashboard/deploy" className="text-indigo-600 font-semibold hover:underline">Deploy</Link>. Make sure your
              <strong> allowed domains</strong> are set for production.
            </p>
            <CodeBlock
              language="HTML"
              code={`<script\n  src="https://YOUR_APP_DOMAIN/widget.js"\n  data-bot-id="YOUR_BOT_ID"\n  data-base-url="https://YOUR_APP_DOMAIN"\n></script>`}
            />
          </Section>

          <Section id="domains" title="Allowed Domains" eyebrow="Security">
            <p>
              To prevent abuse, bots can restrict where the widget is embedded.
              Add your production domain(s) in the bot settings.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="font-bold text-slate-900">Example</div>
              <p className="mt-2 text-sm text-slate-600">
                <code className="font-mono">example.com, app.example.com</code>
              </p>
            </div>
          </Section>

          <Section id="limits" title="Rate Limits" eyebrow="Reliability">
            <p>
              Rate limits protect you from bursts and abuse. If a user hits the
              limit, they’ll see your configured “rate limit hit message”.
            </p>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting" eyebrow="Help">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-slate-900">Bot says it can’t find answers</div>
                  <div className="text-sm text-slate-600">
                    Ensure knowledge is uploaded for the same bot you’re testing.
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Widget shows Unauthorized</div>
                  <div className="text-sm text-slate-600">
                    Check allowed domains. The widget validates the page’s domain
                    against bot settings.
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Nothing happens when clicking Active</div>
                  <div className="text-sm text-slate-600">
                    If the bot isn’t configured, activation is disabled. Use the
                    bot card settings button first.
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="faq" title="FAQ" eyebrow="Common questions">
            <div className="rounded-2xl border border-slate-200 bg-white divide-y">
              <div className="p-4">
                <div className="font-bold text-slate-900">
                  Does the bot use my system prompt?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Yes. The system prompt is loaded from the
                  <code className="font-mono"> bots</code> table for every chat.
                </div>
              </div>
              <div className="p-4">
                <div className="font-bold text-slate-900">
                  How does knowledge work?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Your uploads and pasted text are stored in storage and the
                  public URLs are stored in
                  <code className="font-mono"> knowledge_sources.doc_url</code>.
                </div>
              </div>
              <div className="p-4">
                <div className="font-bold text-slate-900">
                  Can I have multiple bots per workspace?
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Yes. Each bot has its own settings and knowledge sources.
                </div>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
