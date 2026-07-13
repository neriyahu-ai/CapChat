export type ProviderId = "deepseek" | "openai" | "anthropic" | "openrouter";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
};

export type StreamChunk = {
  content: string;
  done: boolean;
  tokenCount?: number;
};

export type ProviderConfig = {
  id: ProviderId;
  label: string;
  apiKeyEnv: string;
  defaultBaseUrl: string;
  models: { id: string; label: string }[];
};

export interface LLMProvider {
  readonly config: ProviderConfig;
  streamChat(messages: ChatMessage[], model: string, signal?: AbortSignal): AsyncGenerator<StreamChunk>;
}
