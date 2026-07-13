import type { LLMProvider, ProviderConfig, ChatMessage, StreamChunk } from "./types";

const CONFIG: ProviderConfig = {
  id: "deepseek",
  label: "DeepSeek",
  apiKeyEnv: "VITE_DEEPSEEK_API_KEY",
  defaultBaseUrl: "https://api.deepseek.com/v1",
  models: [
    { id: "deepseek-chat", label: "DeepSeek V4 Chat" },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner" },
  ],
};

export class DeepSeekProvider implements LLMProvider {
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
      throw new Error(`DeepSeek API error ${res.status}: ${errBody}`);
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

export function createDeepSeekProvider(apiKey?: string): DeepSeekProvider {
  const key = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || "";
  return new DeepSeekProvider(key);
}
