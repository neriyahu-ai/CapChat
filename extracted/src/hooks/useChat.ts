import { useState, useCallback, useRef, useEffect } from "react";
import type { Session, Message } from "@/lib/conductor-types";
import { uid, estimateTokens } from "@/lib/conductor-types";
import { mockResponseFor } from "@/lib/conductor-data";
import { toast } from "sonner";

type UseChatProps = {
  active: Session;
  updateActive: (fn: (s: Session) => Session) => void;
  sessions: Session[];
  activeId: string;
  setSessions: (fn: (prev: Session[]) => Session[]) => void;
};

export function useChat({ active, updateActive, sessions, activeId, setSessions }: UseChatProps) {
  const [input, setInput] = useState("");
  const [autoRun, setAutoRun] = useState(false);
  const autoRunRef = useRef(false);
  const streamingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const streamAgentResponse = useCallback((participantId: string): Promise<void> => {
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

  const runAutoLoop = useCallback(async () => {
    setAutoRun(true);
    autoRunRef.current = true;
    const currentSession = sessions.find((s) => s.id === activeId);
    if (!currentSession) return;
    const enabled = currentSession.participants.filter((p) => p.isEnabled);
    if (enabled.length === 0) {
      toast.error("No enabled participants");
      setAutoRun(false);
      return;
    }
    for (const p of enabled) {
      if (!autoRunRef.current) break;
      await streamAgentResponse(p.id);
      if (!autoRunRef.current) break;
    }
    setAutoRun(false);
    autoRunRef.current = false;
  }, [sessions, activeId, streamAgentResponse]);

  const toggleAutoRun = useCallback(() => {
    if (autoRun) {
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
    await streamAgentResponse(participantId);
  }, [streamAgentResponse]);

  return {
    input,
    setInput,
    autoRun,
    messagesEndRef,
    streamingRef,
    sendUserMessage,
    toggleAutoRun,
    triggerParticipant,
  };
}
