import type { ModelId } from "./conductor-data";

export type Participant = {
  id: string;
  model: ModelId;
  roleName: string;
  systemPrompt: string;
  isEnabled: boolean;
};

export type Message = {
  id: string;
  sender: "user" | "agent";
  authorName: string;
  roleName?: string;
  model?: ModelId;
  content: string;
  streaming?: boolean;
  tokens: number;
};

export type Session = {
  id: string;
  title: string;
  createdAt: number;
  participants: Participant[];
  messages: Message[];
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.length / 4));

export function createSeedSession(): Session {
  return {
    id: uid(),
    title: "New Session",
    createdAt: Date.now(),
    participants: [
      {
        id: uid(),
        model: "gpt-4o",
        roleName: "Optimistic Entrepreneur",
        systemPrompt: "You are a founder-mindset entrepreneur. Focus on speed, leverage, and shipping.",
        isEnabled: true,
      },
      {
        id: uid(),
        model: "claude-3.5-sonnet",
        roleName: "The Skeptic",
        systemPrompt: "You are a rigorous skeptic. Question every assumption.",
        isEnabled: true,
      },
    ],
    messages: [],
  };
}
