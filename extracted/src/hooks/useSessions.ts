import { useState, useCallback } from "react";
import type { Session, Participant } from "@/lib/conductor-types";
import { createSeedSession, uid } from "@/lib/conductor-types";
import type { ModelId } from "@/lib/conductor-data";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => [createSeedSession()]);
  const [activeId, setActiveId] = useState<string>(() => sessions[0].id);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const updateActive = useCallback((fn: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.id === activeId ? fn(s) : s)));
  }, [activeId]);

  const newSession = useCallback(() => {
    const s = createSeedSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        const seed = createSeedSession();
        setActiveId(seed.id);
        return [seed];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  const addParticipant = useCallback((data: { model: ModelId; roleName: string; systemPrompt: string }) => {
    updateActive((s) => ({
      ...s,
      participants: [
        ...s.participants,
        { id: uid(), model: data.model, roleName: data.roleName, systemPrompt: data.systemPrompt, isEnabled: true },
      ],
    }));
  }, [updateActive]);

  const removeParticipant = useCallback((id: string) => {
    updateActive((s) => ({
      ...s,
      participants: s.participants.filter((p) => p.id !== id),
    }));
  }, [updateActive]);

  const toggleParticipant = useCallback((id: string, isEnabled: boolean) => {
    updateActive((s) => ({
      ...s,
      participants: s.participants.map((p) => (p.id === id ? { ...p, isEnabled } : p)),
    }));
  }, [updateActive]);

  return {
    sessions,
    setSessions,
    active,
    activeId,
    setActiveId,
    newSession,
    deleteSession,
    addParticipant,
    removeParticipant,
    toggleParticipant,
    updateActive,
  };
}
