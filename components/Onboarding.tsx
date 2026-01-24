"use client";
import React, { useState, useEffect } from "react";
import {
  Info,
  Sparkles,
  Zap,
  MessageSquare,
  Database,
  CheckCircle,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

enum BotTone {
  PROFESSIONAL = "Professional",
  FRIENDLY = "Friendly",
  CONCISE = "Concise",
  EMPATHETIC = "Empathetic",
}

const Tooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-2">
      <Info
        className="w-4 h-4 text-slate-400 cursor-help inline"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl -top-2 left-6">
          {text}
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 -left-1 top-4"></div>
        </div>
      )}
    </div>
  );
};

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
              step === currentStep
                ? "bg-indigo-600 text-white scale-110"
                : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-400"
            }`}
          >
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={`h-1 w-12 rounded-full transition-all ${
                step < currentStep ? "bg-green-500" : "bg-slate-200"
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isAllowed, setisAllowed] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [testMessages, setTestMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [testInput, setTestInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [workspaceSaved, setWorkspaceSaved] = useState(false);

  const [formData, setFormData] = useState({
    workspaceName: "",
    industry: "",
    botName: "",
    botTone: BotTone.PROFESSIONAL,
    knowledgeType: "url" as "url" | "file" | "text",
    initialUrl: "",
    rawText: "",
  });

  useEffect(() => setIsVisible(true), []);

  const saveWorkspace = async () => {
    // Simulate saving to database
    console.log("Saving workspace:", {
      workspaceName: formData.workspaceName,
      industry: formData.industry,
    });
    //
    const { data } = await supabase.auth.getUser();
    if (!data || !data.user) {
      toast("User not authenticated");
      redirect("/login");
      return;
    }
    console.log(
      `workspace payload`,
      formData.workspaceName,
      formData.industry,
      data.user.id,
    );
    // Workspaces
    const { data: workspace_data, error } = await supabase
      .from("workspaces")
      .insert({
        name: formData.workspaceName,
        tier: "Starter",
        industry: formData.industry,
        owner_id: data.user.id,
      })
      .select("*")
      .single();
    if (error) {
      console.log(`Error`, error);
      return;
    }
    // Workspace users
    await supabase.from("workspace_users").insert({
      auth_user_id: data.user?.id,
      email: data.user.user_metadata.email,
      full_name: data.user.user_metadata.name,
      workspace_id: workspace_data?.id,
    });

    setWorkspaceSaved(true);
  };

  const handleNext = async () => {
    if (step === 1 && !workspaceSaved) {
      await saveWorkspace();
      setStep(2);
    } else if (step === 3) {
      setIsIndexing(true);
      setIndexProgress(0);
    } else if (step === 4) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = async () => {
    // If workspace hasn't been saved yet, save it first
    if (!workspaceSaved) {
      await saveWorkspace();
    }

    // Always redirect to dashboard when skipping
    handleComplete();
  };
  const router = useRouter();
  const handleComplete = () => {
    console.log("Onboarding complete:", formData);
    // Save any additional data that was filled
    console.log("Redirecting to dashboard...");

    // Redirect to dashboard
    router.push("/dashboard");
    // Or use: window.location.href = "/dashboard/overview";
    // Or use router: router.push('/dashboard/overview');
  };

  useEffect(() => {
    let interval: any;
    if (isIndexing) {
      interval = setInterval(() => {
        setIndexProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsIndexing(false);
              setStep(4);
            }, 800);
            return 100;
          }
          return prev + 20;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isIndexing]);

  const handleSendMessage = (text?: string) => {
    const msg = text || testInput;
    if (!msg) return;
    setTestMessages((prev) => [...prev, { role: "user", text: msg }]);
    setTestInput("");
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `As an AI for ${formData.workspaceName || "your workspace"}, I can help with that!`,
        },
      ]);
    }, 800);
  };

  const stepConfig = {
    1: {
      icon: <Database className="w-6 h-6" />,
      title: "Create Your Workspace",
      description:
        "This is the foundation of your AI agent. Your workspace will contain all your agents, settings, and data.",
      tip: "Choose a name that represents your company or project. You can always change this later in settings.",
    },
    2: {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Customize Your AI Agent",
      description:
        "Give your agent a personality! This helps create a consistent brand experience for your customers.",
      tip: "Think about how you want your agent to communicate. Professional for B2B? Friendly for consumer apps?",
    },
    3: {
      icon: <Database className="w-6 h-6" />,
      title: "Connect Your Knowledge Base",
      description:
        "Feed your agent with information from your documentation, website, or custom content.",
      tip: "Start with your most frequently asked questions or main documentation. You can add more sources later.",
    },
    4: {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Test Your Agent",
      description:
        "Try out your agent before going live. Ask it questions to see how it responds.",
      tip: "Test with real customer questions you receive often. This helps validate your agent is ready.",
    },
  };

  const currentStepConfig = stepConfig[step as keyof typeof stepConfig];

  useEffect(() => {
    const isOnboarded = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        redirect("/login");
      }
      const { data } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      if (data) {
        console.log("lol");
        redirect("/dashboard");
      } else {
        setisAllowed(true);
      }
    };
    isOnboarded();
  }, []);

  return (
    isAllowed && (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

        <div
          className={`w-full max-w-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {!isIndexing && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Welcome to Your AI Agent Setup
                  </h1>
                  <p className="text-sm text-slate-600 mt-2">
                    Let's get your intelligent assistant up and running in
                    minutes
                  </p>
                </div>
                {step === 1 ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full uppercase tracking-tight border border-red-200">
                    Required
                  </span>
                ) : (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-tight border border-blue-200">
                    Optional
                  </span>
                )}
              </div>
              <StepIndicator currentStep={step} totalSteps={4} />
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-200 relative overflow-hidden">
            {/* Step indicator badge */}
            {!isIndexing && (
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full">
                {currentStepConfig.icon}
                <span className="text-xs font-bold text-indigo-600">
                  Step {step} of 4
                </span>
              </div>
            )}

            {isIndexing ? (
              <div className="py-12 text-center space-y-6">
                <div className="flex justify-center mb-4">
                  <Zap className="w-16 h-16 text-indigo-600 animate-pulse" />
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${indexProgress}%` }}
                  ></div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Processing Your Knowledge Base...
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    We're analyzing and indexing your content to make your agent
                    smarter
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {indexProgress}% complete
                </p>
              </div>
            ) : (
              <>
                {/* Step header */}
                <div className="mb-8 pb-6 border-b border-slate-100">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                    {currentStepConfig.title}
                    <Tooltip text={currentStepConfig.tip} />
                  </h2>
                  <p className="text-sm text-slate-600">
                    {currentStepConfig.description}
                  </p>
                </div>

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Workspace Name *
                        <Tooltip text="This will be visible to your team and helps organize your AI agents. Example: 'Acme Support' or 'TechCorp AI'" />
                      </label>
                      <input
                        className="w-full px-5 py-4 rounded-xl text-slate-900 border-2 border-slate-200 outline-none focus:border-indigo-600 transition-all"
                        placeholder="e.g., Acme Corp, TechStart, My Business"
                        value={formData.workspaceName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workspaceName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Industry *
                        <Tooltip text="Helps us optimize your agent for industry-specific terminology and common use cases" />
                      </label>
                      <select
                        className="w-full px-5 py-4 rounded-xl text-slate-900 border-2 border-slate-200 focus:border-indigo-600 outline-none transition-all"
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                      >
                        <option value="">Select your industry</option>
                        <option value="SaaS">SaaS & Technology</option>
                        <option value="Retail">E-commerce & Retail</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance & Banking</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-indigo-900 mb-1">
                            Why we need this:
                          </p>
                          <p>
                            Your workspace is where all your AI agents live.
                            After creating it, you can invite team members,
                            manage multiple agents, and track analytics.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Agent Name
                        <Tooltip text="Give your agent a friendly name. This is what customers will see. Popular choices: Maya, Alex, Riley" />
                      </label>
                      <input
                        className="w-full px-5 py-4 rounded-xl text-slate-900 border-2 border-slate-200 outline-none focus:border-indigo-600 transition-all"
                        placeholder="e.g., Maya, Alex, Support Bot"
                        value={formData.botName}
                        onChange={(e) =>
                          setFormData({ ...formData, botName: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Communication Style
                        <Tooltip text="Choose how your agent communicates. You can fine-tune this later with custom instructions" />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(BotTone).map((tone) => (
                          <button
                            key={tone}
                            onClick={() =>
                              setFormData({ ...formData, botTone: tone as any })
                            }
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.botTone === tone
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="font-bold text-slate-900 text-sm">
                              {tone}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {tone === BotTone.PROFESSIONAL &&
                                "Formal and business-focused"}
                              {tone === BotTone.FRIENDLY &&
                                "Warm and conversational"}
                              {tone === BotTone.CONCISE &&
                                "Brief and to the point"}
                              {tone === BotTone.EMPATHETIC &&
                                "Understanding and supportive"}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-blue-900 mb-1">
                            Pro tip:
                          </p>
                          <p>
                            Match your agent's tone to your brand voice. B2B
                            companies often prefer Professional, while consumer
                            apps work well with Friendly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Knowledge Source
                        <Tooltip text="Choose how you want to provide information to your agent. URL crawls your website, Text lets you paste custom content" />
                      </label>
                      <div className="flex gap-3 p-2 bg-slate-100 rounded-xl">
                        {[
                          { value: "url", label: "Website URL", icon: "🌐" },
                          { value: "text", label: "Custom Text", icon: "📝" },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                knowledgeType: type.value as any,
                              })
                            }
                            className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all ${
                              formData.knowledgeType === type.value
                                ? "bg-white shadow-md text-indigo-600"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.knowledgeType === "url" ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Documentation URL
                        </label>
                        <input
                          className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 text-slate-900 outline-none focus:border-indigo-600 transition-all"
                          placeholder="https://docs.yoursite.com or https://yoursite.com/help"
                          value={formData.initialUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              initialUrl: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          We'll crawl this page and linked pages to build your
                          knowledge base
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                          Custom Content
                        </label>
                        <textarea
                          className="w-full px-5 py-4 rounded-xl text-slate-900 border-2 border-slate-200 h-40 outline-none focus:border-indigo-600 transition-all"
                          placeholder="Paste your FAQs, product information, or any text you want your agent to know about..."
                          value={formData.rawText}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rawText: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Add product details, FAQs, policies, or any
                          information your agent should know
                        </p>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <Database className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-amber-900 mb-1">
                            Don't worry:
                          </p>
                          <p>
                            You can add more sources, upload files, and sync
                            with tools like Notion, Google Drive, or Zendesk
                            later from your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Test Conversation
                        <Tooltip text="Try asking questions to see how your agent responds. This helps you validate it's working correctly" />
                      </label>
                      <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-xl h-64 overflow-y-auto space-y-3">
                        {testMessages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500">
                              Send a message to test your agent
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              Try: "What are your business hours?" or "Tell me
                              about your products"
                            </p>
                          </div>
                        ) : (
                          testMessages.map((m, i) => (
                            <div
                              key={i}
                              className={`text-sm p-4 rounded-xl max-w-[80%] ${
                                m.role === "user"
                                  ? "bg-indigo-600 text-white ml-auto shadow-md"
                                  : "bg-white border-2 border-slate-200 text-slate-900"
                              }`}
                            >
                              {m.text}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <input
                        className="flex-1 px-5 py-4 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-indigo-600 transition-all"
                        placeholder="Type a test message..."
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        className="px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                      >
                        Send
                      </button>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-green-900 mb-1">
                            Almost done!
                          </p>
                          <p>
                            Once you're satisfied with the responses, click
                            "Complete Setup" to launch your agent. You can
                            refine it anytime from your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                  {step > 1 && !workspaceSaved && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-4 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                      ← Back
                    </button>
                  )}

                  {step > 1 && (
                    <button
                      onClick={handleSkip}
                      className="px-6 py-4 text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      Save & Go to Dashboard
                    </button>
                  )}

                  <button
                    disabled={
                      step === 1 &&
                      (!formData.workspaceName || !formData.industry)
                    }
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {step === 1 && "Save & Continue →"}
                    {step === 2 && "Continue →"}
                    {step === 3 && "Process Knowledge →"}
                    {step === 4 && "Complete Setup ✓"}
                  </button>
                </div>

                {/* Footer hint */}
                {step > 1 && (
                  <p className="text-xs text-center text-slate-400 mt-4">
                    Click "Save & Go to Dashboard" to finish setup later
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Onboarding;
