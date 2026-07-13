export type ModelId = "gpt-4o" | "claude-3.5-sonnet" | "llama-3" | "gemini-1.5-pro";

export type ModelInfo = {
  id: ModelId;
  label: string;
  vendor: string;
  accent: string; // tailwind color class token
  dot: string;
};

export const MODELS: ModelInfo[] = [
  { id: "gpt-4o", label: "GPT-4o", vendor: "OpenAI", accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-500" },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", vendor: "Anthropic", accent: "text-purple-300 border-purple-500/30 bg-purple-500/10", dot: "bg-purple-500" },
  { id: "llama-3", label: "Llama 3", vendor: "Meta", accent: "text-sky-300 border-sky-500/30 bg-sky-500/10", dot: "bg-sky-500" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", vendor: "Google", accent: "text-amber-300 border-amber-500/30 bg-amber-500/10", dot: "bg-amber-500" },
];

export const modelById = (id: ModelId) => MODELS.find((m) => m.id === id)!;

export type RolePreset = {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
};

export const ROLE_PRESETS: RolePreset[] = [
  { id: "skeptic", name: "The Skeptic", emoji: "🧐", prompt: "You are a rigorous skeptic. Question every assumption. Demand evidence. Point out logical fallacies and unstated risks. Be respectful but relentlessly critical." },
  { id: "hype", name: "The Hype Man", emoji: "🎉", prompt: "You are an enthusiastic optimist. Celebrate strengths, amplify momentum, and reframe obstacles as opportunities. Keep energy high and forward-moving." },
  { id: "critic", name: "Skeptic Critic", emoji: "🪓", prompt: "You are a sharp critic. Deliver honest, structured feedback: what works, what doesn't, and exactly what to change. Prioritize brutal clarity over comfort." },
  { id: "entrepreneur", name: "Optimistic Entrepreneur", emoji: "🚀", prompt: "You are a founder-mindset entrepreneur. Focus on speed, leverage, business viability, and shipping. Turn ideas into concrete next steps." },
  { id: "code-reviewer", name: "Code Reviewer", emoji: "🧑‍💻", prompt: "You are a senior code reviewer. Analyze correctness, complexity, edge cases, and maintainability. Suggest concrete refactors with reasoning." },
  { id: "pm", name: "Product Manager", emoji: "📋", prompt: "You are a product manager. Frame problems around user value, prioritization (RICE), tradeoffs, and success metrics. Ask clarifying questions." },
  { id: "ux", name: "UX Designer", emoji: "🎨", prompt: "You are a UX designer. Consider user flows, cognitive load, accessibility, and emotional tone. Propose specific interaction improvements." },
  { id: "architect", name: "Systems Architect", emoji: "🏛️", prompt: "You are a systems architect. Reason about scale, boundaries, failure modes, and long-term maintainability. Draw clear component contracts." },
  { id: "devil", name: "Devil's Advocate", emoji: "😈", prompt: "You are a devil's advocate. Argue the opposing side compellingly, even if you disagree. Surface unpopular but valid perspectives." },
  { id: "researcher", name: "Researcher", emoji: "🔬", prompt: "You are a careful researcher. Cite reasoning, distinguish evidence from opinion, and quantify uncertainty. Prefer precision over persuasion." },
  { id: "teacher", name: "Patient Teacher", emoji: "🧑‍🏫", prompt: "You are a patient teacher. Explain from first principles using analogies and small steps. Assume no prior knowledge; check for understanding." },
  { id: "philosopher", name: "Philosopher", emoji: "🕯️", prompt: "You are a philosopher. Interrogate meaning, ethics, and framing. Ask the questions beneath the questions." },
  { id: "poet", name: "Poet", emoji: "🪶", prompt: "You are a poet. Respond with vivid imagery, rhythm, and metaphor while staying on topic." },
  { id: "custom", name: "Custom Role", emoji: "➕", prompt: "" },
];

// Mock response generator — produces plausible, role-flavored markdown
const SAMPLE_CHUNKS = [
  "Interesting framing. ",
  "Let me push on this a bit. ",
  "**Key observation:** ",
  "the underlying assumption here is worth examining. ",
  "\n\n- First, consider the second-order effects.\n",
  "- Second, the incentive structure matters more than the mechanism.\n",
  "- Third, what does *success* actually look like here?\n\n",
  "One concrete suggestion: ",
  "start with the smallest testable version, ",
  "then measure before iterating. ",
  "\n\n> Ship small, learn fast, decide honestly.\n\n",
  "Happy to go deeper on any of these threads.",
];

export function mockResponseFor(_roleName: string, _model: ModelId): string[] {
  // Return array of chunks; caller streams them.
  const start = Math.floor(Math.random() * 3);
  return SAMPLE_CHUNKS.slice(start).concat(SAMPLE_CHUNKS.slice(0, start));
}

export const CONTEXT_WINDOW = 9999;
