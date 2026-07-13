import type { ProviderConfig } from "./types";
import { OpenRouterProvider, createOpenRouterProvider } from "./openrouter";
import { DeepSeekProvider, createDeepSeekProvider } from "./deepseek";
import type { LLMProvider } from "./types";

export const PROVIDER_CONFIGS: ProviderConfig[] = [
  OpenRouterProvider.prototype.config,
  DeepSeekProvider.prototype.config,
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
  const apiKey = keys[providerId] || "";
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
