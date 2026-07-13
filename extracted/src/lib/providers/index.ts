import { createOpenRouterProvider } from "./openrouter";
import { createDeepSeekProvider } from "./deepseek";
import type { LLMProvider, ProviderConfig } from "./types";

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  { id: "openrouter", label: "OpenRouter", apiKeyEnv: "VITE_OPENROUTER_API_KEY", defaultBaseUrl: "https://openrouter.ai/api/v1", models: [
    { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)" },
    { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B (free)" },
    { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder (free)" },
    { id: "deepseek/deepseek-chat", label: "DeepSeek V4 Chat" },
    { id: "openai/gpt-4o", label: "GPT-4o" },
    { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { id: "meta-llama/llama-3-70b-instruct", label: "Llama 3 70B" },
    { id: "google/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ]},
  { id: "deepseek", label: "DeepSeek", apiKeyEnv: "VITE_DEEPSEEK_API_KEY", defaultBaseUrl: "https://api.deepseek.com/v1", models: [
    { id: "deepseek-chat", label: "DeepSeek Chat" },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner" },
  ]},
];

const providerConstructors: Record<string, (apiKey: string) => LLMProvider> = {
  openrouter: (key) => createOpenRouterProvider(key),
  deepseek: (key) => createDeepSeekProvider(key),
};

const STORAGE_KEY = "conductor-api-keys";

export function getSavedApiKeys(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveApiKey(providerId: string, key: string): void {
  const keys = getSavedApiKeys();
  keys[providerId] = key;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function createProvider(providerId: string): LLMProvider | null {
  const keys = getSavedApiKeys();
  let apiKey = keys[providerId] || "";
  if (!apiKey) {
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY || "";
    if (envKey) apiKey = envKey;
  }
  if (!apiKey) return null;
  const ctor = providerConstructors[providerId];
  return ctor ? ctor(apiKey) : null;
}

export function flattenModelOptions(): { providerId: string; modelId: string; label: string }[] {
  const result: { providerId: string; modelId: string; label: string }[] = [];
  for (const config of PROVIDER_CONFIGS) {
    for (const model of config.models) {
      result.push({ providerId: config.id, modelId: model.id, label: `${config.label}: ${model.label}` });
    }
  }
  return result;
}
