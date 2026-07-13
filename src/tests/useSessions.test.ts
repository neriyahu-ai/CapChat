import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessions } from "../hooks/useSessions";

describe("useSessions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with one default session", () => {
    const { result } = renderHook(() => useSessions());
    expect(result.current.sessions.length).toBe(1);
    expect(result.current.active).toBeDefined();
    expect(result.current.activeId).toBe(result.current.sessions[0].id);
  });

  it("newSession creates a new session and switches to it", () => {
    const { result } = renderHook(() => useSessions());
    const prevId = result.current.activeId;
    act(() => result.current.newSession());
    expect(result.current.sessions.length).toBe(2);
    expect(result.current.activeId).not.toBe(prevId);
  });

  it("deleteSession removes session and switches if needed", () => {
    const { result } = renderHook(() => useSessions());
    const firstId = result.current.activeId;
    act(() => result.current.newSession());
    const secondId = result.current.activeId;
    expect(result.current.sessions.length).toBe(2);

    act(() => result.current.deleteSession(firstId));
    expect(result.current.sessions.length).toBe(1);
    expect(result.current.activeId).toBe(secondId);
  });

  it("addParticipant adds to active session", () => {
    const { result } = renderHook(() => useSessions());
    const countBefore = result.current.active.participants.length;
    act(() =>
      result.current.addParticipant({
        roleName: "New Agent",
        systemPrompt: "Test",
        model: "deepseek-chat",
      })
    );
    expect(result.current.active.participants.length).toBe(countBefore + 1);
    const added = result.current.active.participants[result.current.active.participants.length - 1];
    expect(added.roleName).toBe("New Agent");
    expect(added.id).toBeTruthy();
  });

  it("removeParticipant removes from active session", () => {
    const { result } = renderHook(() => useSessions());
    act(() =>
      result.current.addParticipant({
        roleName: "To Remove",
        systemPrompt: "",
        model: "deepseek-chat",
      })
    );
    const id = result.current.active.participants[result.current.active.participants.length - 1].id;
    act(() => result.current.removeParticipant(id));
    expect(result.current.active.participants.find((p) => p.id === id)).toBeUndefined();
  });

  it("toggleParticipant enables/disables", () => {
    const { result } = renderHook(() => useSessions());
    act(() =>
      result.current.addParticipant({
        roleName: "ToggleMe",
        systemPrompt: "",
        model: "deepseek-chat",
      })
    );
    const p = result.current.active.participants[result.current.active.participants.length - 1];
    expect(p.isEnabled).toBe(true);

    act(() => result.current.toggleParticipant(p.id, false));
    expect(result.current.active.participants.find((x) => x.id === p.id)!.isEnabled).toBe(false);

    act(() => result.current.toggleParticipant(p.id, true));
    expect(result.current.active.participants.find((x) => x.id === p.id)!.isEnabled).toBe(true);
  });

  it("editParticipant updates systemPrompt", () => {
    const { result } = renderHook(() => useSessions());
    act(() =>
      result.current.addParticipant({
        roleName: "Original",
        systemPrompt: "Old",
        model: "deepseek-chat",
      })
    );
    const p = result.current.active.participants[result.current.active.participants.length - 1];
    act(() => result.current.editParticipant(p.id, "New prompt"));
    const updated = result.current.active.participants.find((x) => x.id === p.id)!;
    expect(updated.systemPrompt).toBe("New prompt");
  });

  it("reorderParticipant moves up and down", () => {
    const { result } = renderHook(() => useSessions());
    // Add 2 participants
    act(() =>
      result.current.addParticipant({
        roleName: "First",
        systemPrompt: "",
        model: "deepseek-chat",
      })
    );
    act(() =>
      result.current.addParticipant({
        roleName: "Second",
        systemPrompt: "",
        model: "deepseek-chat",
      })
    );
    const ps = () => result.current.active.participants;
    const firstId = ps()[ps().length - 2].id;
    const secondId = ps()[ps().length - 1].id;

    // Move second up
    act(() => result.current.reorderParticipant(secondId, "up"));
    expect(ps()[ps().length - 2].id).toBe(secondId);
    expect(ps()[ps().length - 1].id).toBe(firstId);

    // Move it back down
    act(() => result.current.reorderParticipant(secondId, "down"));
    expect(ps()[ps().length - 1].id).toBe(secondId);
  });

  it("setActiveId changes active session", () => {
    const { result } = renderHook(() => useSessions());
    const firstId = result.current.activeId;
    act(() => result.current.newSession());
    const secondId = result.current.activeId;

    act(() => result.current.setActiveId(firstId));
    expect(result.current.activeId).toBe(firstId);

    act(() => result.current.setActiveId(secondId));
    expect(result.current.activeId).toBe(secondId);
  });

  it("updateActive can modify active session", () => {
    const { result } = renderHook(() => useSessions());
    const origTitle = result.current.active.title;
    act(() => result.current.updateActive((s) => ({ ...s, title: "Updated" })));
    expect(result.current.active.title).toBe("Updated");
  });
});
