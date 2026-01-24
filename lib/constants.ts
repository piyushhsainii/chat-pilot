export const ALLOWED_MODELS = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    credits: 1,
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    credits: 2,
    expensive: true,
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    credits: 3,
    expensive: true,
  },
];

export const TEMPLATES = {
  faq: {
    label: "FAQ Bot",
    systemPrompt:
      "You answer frequently asked questions clearly and concisely using the provided knowledge base.",
    fallback: "I couldn’t find that in the FAQ. Please contact support.",
  },
  support: {
    label: "Support Agent",
    systemPrompt:
      "You are a professional support agent. Be empathetic, concise, and solution-oriented.",
    fallback: "I’m not sure about that yet. Let me connect you to support.",
  },
  general: {
    label: "General Assistant",
    systemPrompt:
      "You are a helpful AI assistant that answers user questions politely and clearly.",
    fallback: "I’m not sure about that. Could you rephrase?",
  },
};
