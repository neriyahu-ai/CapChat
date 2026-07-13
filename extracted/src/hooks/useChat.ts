import { useState, useCallback, useRef, useEffect } from "react";
import type { Session, Message } from "@/lib/conductor-types";
import { uid, estimateTokens } from "@/lib/conductor-types";
import { mockResponseFor } from "@/lib/conductor-data";
import { Orchestrator } from "@/lib/Orchestrator";
import { createProvider, getSavedApiKeys } from "@/lib/providers";
import type { ChatMessage } from "@/lib/providers/types";
import { TelemetryStore } from "@/lib/TelemetryStore";
import { toast } from "sonner";

type UseChatProps = {
  active: Session;
  updateActive: (fn: (s: Session) => Session) => void;
  sessions: Session[];
  activeId: string;
  setSessions: (fn: (prev: Session[]) => Session[]) => void;
};

function buildChatMessages(session: Session, participantId: string): ChatMessage[] {
  const p = session.participants.find((x) => x.id === participantId);
  if (!p) return [];

  const messages: ChatMessage[] = [
    { role: "system", content: p.systemPrompt },
  ];

  for (const msg of session.messages) {
    if (msg.sender === "user") {
      messages.push({ role: "user", content: msg.content, name: "Moderator" });
    } else {
      const label = `${msg.authorName} (${msg.roleName || msg.authorName})`;
      messages.push({ role: "assistant", content: msg.content, name: label });
    }
  }

  return messages;
}

export function useChat({ active, updateActive, sessions, activeId, setSessions }: UseChatProps) {
  const [input, setInput] = useState("");
  const [autoRun, setAutoRun] = useState(false);
  const [useRealApi, setUseRealApi] = useState(false);
  const autoRunRef = useRef(false);
  const streamingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orchestratorRef = useRef(new Orchestrator());
  const apiPermissionRef = useRef(false);

  useEffect(() => {
    autoRunRef.current = autoRun;
  }, [autoRun]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, active?.messages[active.messages.length - 1]?.content]);

  const sendUserMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const msg: Message = {
      id: uid(),
      sender: "user",
      authorName: "You",
      content: text,
      tokens: estimateTokens(text),
    };
    updateActive((s) => ({
      ...s,
      title: s.messages.length === 0 ? text.slice(0, 40) : s.title,
      messages: [...s.messages, msg],
    }));
    setInput("");
  }, [input, updateActive]);

  const streamMockResponse = useCallback((participantId: string): Promise<void> => {
    const telemetryId = TelemetryStore.start(uid(), participantId, "mock", "mock", 0);
    return new Promise((resolve) => {
      const session = sessions.find((s) => s.id === activeId);
      const p = session?.participants.find((x) => x.id === participantId);
      if (!p) return resolve();

      const chunks = mockResponseFor(p.roleName, p.model);
      const msgId = uid();
      const initial: Message = {
        id: msgId,
        sender: "agent",
        authorName: p.roleName,
        roleName: p.roleName,
        model: p.model,
        content: "",
        streaming: true,
        tokens: 0,
      };
      updateActive((s) => ({ ...s, messages: [...s.messages, initial] }));

      streamingRef.current = true;
      let i = 0;
      const interval = setInterval(() => {
        if (i >= chunks.length) {
          clearInterval(interval);
          streamingRef.current = false;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === msgId
                        ? { ...m, streaming: false, tokens: estimateTokens(m.content) }
                        : m,
                    ),
                  }
                : s,
            ),
          );
          TelemetryStore.complete(telemetryId, estimateTokens(chunks.join("")));
          resolve();
          return;
        }
        const chunk = chunks[i++];
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId ? { ...m, content: m.content + chunk } : m,
                  ),
                }
              : s,
          ),
        );
      }, 180);
    });
  }, [sessions, activeId, updateActive, setSessions]);

  const streamRealResponse = useCallback(async (participantId: string): Promise<void> => {
    const telemetryId = TelemetryStore.start(uid(), participantId, "", "", 0);
    const session = sessions.find((s) => s.id === activeId);
    if (!session) return;
    const p = session.participants.find((x) => x.id === participantId);
    if (!p) return;

    const provider = createProvider("openrouter") || createProvider("deepseek");
    if (!provider) {
      toast.error("No API key configured. Add one in API Keys settings.");
      return;
    }

    const msgId = uid();
    const initial: Message = {
      id: msgId,
      sender: "agent",
      authorName: p.roleName,
      roleName: p.roleName,
      model: p.model,
      content: "",
      streaming: true,
      tokens: 0,
    };
    updateActive((s) => ({ ...s, messages: [...s.messages, initial] }));
    streamingRef.current = true;

    try {
      const messages = buildChatMessages(session, participantId);
      const stream = provider.streamChat(messages, p.model);
      let fullContent = "";

      for await (const chunk of stream) {
        if (!streamingRef.current) break;
        fullContent += chunk.content;
        TelemetryStore.update(telemetryId, estimateTokens(fullContent));
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId ? { ...m, content: fullContent } : m,
                  ),
                }
              : s,
          ),
        );
        if (chunk.done) break;
      }

      TelemetryStore.complete(telemetryId, estimateTokens(fullContent));
    } catch (err: any) {
      TelemetryStore.error(telemetryId, err.message);
      toast.error(`API error: ${err.message}`);
    }

    streamingRef.current = false;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId
                  ? { ...m, streaming: false, tokens: estimateTokens(m.content) }
                  : m,
              ),
            }
          : s,
      ),
    );
  }, [sessions, activeId, updateActive, setSessions]);

  const streamAgentResponse = useCallback(async (participantId: string): Promise<void> => {
    const hasKeys = Object.keys(getSavedApiKeys()).some((k) => getSavedApiKeys()[k]);

    if (useRealApi && hasKeys) {
      if (!apiPermissionRef.current) {
        toast("API call pending — approve in settings", { duration: 5000 });
        return;
      }
      await streamRealResponse(participantId);
    } else {
      await streamMockResponse(participantId);
    }
  }, [useRealApi, streamMockResponse, streamRealResponse]);

  const runAutoLoop = useCallback(async () => {
    const session = sessions.find((s) => s.id === activeId);
    if (!session) return;
    const enabled = session.participants.filter((p) => p.isEnabled);
    if (enabled.length === 0) {
      toast.error("No enabled participants");
      return;
    }

    orchestratorRef.current.dispatch({ type: "START_AUTORUN", participants: session.participants });
    setAutoRun(true);
    autoRunRef.current = true;

    const queue = orchestratorRef.current.getQueue();
    for (const p of queue) {
      if (!autoRunRef.current) break;
      await streamAgentResponse(p.id);
      if (!autoRunRef.current) break;
      orchestratorRef.current.dispatch({ type: "TURN_COMPLETE" });
    }

    orchestratorRef.current.dispatch({ type: "PASS_COMPLETE" });
    setAutoRun(false);
    autoRunRef.current = false;
  }, [sessions, activeId, streamAgentResponse]);

  const toggleAutoRun = useCallback(() => {
    if (autoRun) {
      orchestratorRef.current.dispatch({ type: "STOP_AUTORUN" });
      setAutoRun(false);
      autoRunRef.current = false;
    } else {
      void runAutoLoop();
    }
  }, [autoRun, runAutoLoop]);

  const triggerParticipant = useCallback(async (participantId: string) => {
    if (streamingRef.current) {
      toast.info("A response is already streaming");
      return;
    }
    orchestratorRef.current.dispatch({ type: "TRIGGER_MANUAL", participantId });
    await streamAgentResponse(participantId);
  }, [streamAgentResponse]);

  const enableRealApi = useCallback(() => {
    const hasKeys = Object.keys(getSavedApiKeys()).some((k) => getSavedApiKeys()[k]);
    if (!hasKeys) {
      toast.error("Configure an API key first in API Keys settings");
      return;
    }
    apiPermissionRef.current = true;
    setUseRealApi(true);
  }, []);

  const disableRealApi = useCallback(() => {
    apiPermissionRef.current = false;
    setUseRealApi(false);
  }, []);

  return {
    input,
    setInput,
    autoRun,
    useRealApi,
    messagesEndRef,
    sendUserMessage,
    toggleAutoRun,
    triggerParticipant,
    enableRealApi,
    disableRealApi,
  };
}
