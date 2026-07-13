import type { LLMProvider, ProviderConfig, ChatMessage, StreamChunk } from "./types";

const CONFIG: ProviderConfig = {
  id: "openrouter",
  label: "OpenRouter",
  apiKeyEnv: "VITE_OPENROUTER_API_KEY",
  defaultBaseUrl: "https://openrouter.ai/api/v1",
  models: [
    { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B (free)" },
    { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B (free)" },
    { id: "qwen/qwen3-coder:free", label: "Qwen3 Coder (free)" },
    { id: "deepseek/deepseek-chat", label: "DeepSeek V4 Chat" },
    { id: "openai/gpt-4o", label: "GPT-4o" },
    { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { id: "meta-llama/llama-3-70b-instruct", label: "Llama 3 70B" },
    { id: "google/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
};

export class OpenRouterProvider implements LLMProvider {
  readonly config = CONFIG;
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || CONFIG.defaultBaseUrl;
  }

  async *streamChat(
    messages: ChatMessage[],
    model: string,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "conductor-app",
        "X-Title": "Conductor",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "unknown error");
      throw new Error(`OpenRouter API error ${res.status}: ${errBody}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            yield { content: "", done: true };
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || "";
            const finishReason = json.choices?.[0]?.finish_reason;
            yield {
              content: delta,
              done: finishReason === "stop" || finishReason === "length",
            };
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { content: "", done: true };
  }
}

export function createOpenRouterProvider(apiKey?: string): OpenRouterProvider {
  const key = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || "";
  return new OpenRouterProvider(key);
}
