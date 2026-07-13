import { describe, it, expect } from "vitest";
import { Orchestrator } from "../lib/Orchestrator";
import type { Participant } from "../lib/conductor-types";

const makeP = (id: string, enabled = true): Participant => ({
  id,
  roleName: id,
  systemPrompt: "",
  model: "deepseek-chat" as any,
  isEnabled: enabled,
});

describe("Orchestrator", () => {
  it("starts with idle state", () => {
    const o = new Orchestrator();
    expect(o.getState()).toEqual({ isAutorun: false, currentTurnIndex: 0 });
    expect(o.isRunning()).toBe(false);
    expect(o.currentParticipant()).toBeNull();
  });

  describe("START_AUTORUN", () => {
    it("queues enabled participants and sets autorun", () => {
      const o = new Orchestrator();
      const ps = [makeP("a"), makeP("b"), makeP("c")];
      o.dispatch({ type: "START_AUTORUN", participants: ps });
      expect(o.getState().isAutorun).toBe(true);
      expect(o.getState().currentTurnIndex).toBe(0);
      expect(o.currentParticipant()!.id).toBe("a");
    });

    it("skips disabled participants", () => {
      const o = new Orchestrator();
      const ps = [makeP("a"), makeP("b", false), makeP("c")];
      o.dispatch({ type: "START_AUTORUN", participants: ps });
      expect(o.getQueue()).toHaveLength(2);
      expect(o.getQueue().map((p) => p.id)).toEqual(["a", "c"]);
    });

    it("no-op when no enabled participants", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a", false)] });
      expect(o.isRunning()).toBe(false);
    });
  });

  describe("TURN_COMPLETE", () => {
    it("advances to next participant", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a"), makeP("b")] });
      o.dispatch({ type: "TURN_COMPLETE" });
      expect(o.getState().currentTurnIndex).toBe(1);
      expect(o.currentParticipant()!.id).toBe("b");
    });

    it("ends autorun after last participant", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a")] });
      o.dispatch({ type: "TURN_COMPLETE" });
      expect(o.isRunning()).toBe(false);
      expect(o.currentParticipant()).toBeNull();
    });
  });

  describe("STOP_AUTORUN", () => {
    it("clears queue and resets state", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a"), makeP("b")] });
      o.dispatch({ type: "STOP_AUTORUN" });
      expect(o.isRunning()).toBe(false);
      expect(o.getQueue()).toHaveLength(0);
      expect(o.currentParticipant()).toBeNull();
    });
  });

  describe("TRIGGER_MANUAL", () => {
    it("sets current index to matching participant", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a"), makeP("b"), makeP("c")] });
      o.dispatch({ type: "TRIGGER_MANUAL", participantId: "c" });
      expect(o.currentParticipant()!.id).toBe("c");
    });

    it("no-op when participant not in queue", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a")] });
      o.dispatch({ type: "TRIGGER_MANUAL", participantId: "nonexistent" });
      expect(o.currentParticipant()!.id).toBe("a");
    });
  });

  describe("PASS_COMPLETE", () => {
    it("resets to idle", () => {
      const o = new Orchestrator();
      o.dispatch({ type: "START_AUTORUN", participants: [makeP("a")] });
      o.dispatch({ type: "PASS_COMPLETE" });
      expect(o.isRunning()).toBe(false);
      expect(o.getQueue()).toHaveLength(0);
    });
  });
});
