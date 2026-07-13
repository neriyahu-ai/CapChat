import { describe, it, expect, beforeEach, vi } from "vitest";
import { TimelineStore } from "../lib/TimelineStore";
import type { Session, Message, Participant } from "../lib/conductor-types";

function makeMsg(overrides: Partial<Message> = {}): Message {
  return {
    id: "msg-1",
    sessionId: "sess-1",
    sender: "user",
    content: "hello",
    roleName: null,
    authorName: "User",
    tokens: 10,
    streaming: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: "p1",
    roleName: "Agent",
    systemPrompt: "Be helpful.",
    model: "deepseek-chat",
    providerId: "deepseek",
    isEnabled: true,
    color: "#8b5cf6",
    avatar: "A",
    ...overrides,
  };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "sess-1",
    title: "Test Session",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    participants: [makeParticipant()],
    messages: [],
    ...overrides,
  };
}

describe("TimelineStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("save / load / clear", () => {
    it("save and load sessions", () => {
      const sessions = [makeSession({ id: "s1" }), makeSession({ id: "s2" })];
      TimelineStore.save(sessions);
      const loaded = TimelineStore.load();
      expect(loaded).toEqual(sessions);
    });

    it("load returns null when nothing saved", () => {
      expect(TimelineStore.load()).toBeNull();
    });

    it("clear removes stored sessions", () => {
      TimelineStore.save([makeSession()]);
      TimelineStore.clear();
      expect(TimelineStore.load()).toBeNull();
    });

    it("handles corrupt localStorage gracefully", () => {
      localStorage.setItem("conductor-sessions", "not-json");
      expect(TimelineStore.load()).toBeNull();
    });
  });

  describe("getContext", () => {
    it("returns all messages when under limit", () => {
      const msgs = Array.from({ length: 5 }, (_, i) => makeMsg({ id: `m${i}` }));
      expect(TimelineStore.getContext(msgs)).toHaveLength(5);
    });

    it("returns last CONTEXT_WINDOW messages when over limit", () => {
      const msgs = Array.from({ length: 10001 }, (_, i) => makeMsg({ id: `m${i}` }));
      const ctx = TimelineStore.getContext(msgs);
      expect(ctx.length).toBe(9999);
      expect(ctx[0].id).toBe("m2");
    });
  });

  describe("totalTokens", () => {
    it("sums tokens correctly", () => {
      const msgs = [makeMsg({ tokens: 10 }), makeMsg({ tokens: 20 }), makeMsg({ tokens: 30 })];
      expect(TimelineStore.totalTokens(msgs)).toBe(60);
    });

    it("returns 0 for empty array", () => {
      expect(TimelineStore.totalTokens([])).toBe(0);
    });
  });

  describe("contextUtilization", () => {
    it("returns percentage", () => {
      const msgs = Array.from({ length: 1000 }, (_, i) => makeMsg({ tokens: 1 }));
      expect(TimelineStore.contextUtilization(msgs)).toBeCloseTo(10, 1);
    });

    it("caps at 100", () => {
      const msgs = Array.from({ length: 20000 }, (_, i) => makeMsg({ tokens: 1 }));
      expect(TimelineStore.contextUtilization(msgs)).toBe(100);
    });
  });

  describe("exportAsJson", () => {
    it("returns valid JSON string", () => {
      const session = makeSession();
      const json = TimelineStore.exportAsJson(session);
      const parsed = JSON.parse(json);
      expect(parsed.id).toBe("sess-1");
      expect(parsed.title).toBe("Test Session");
    });
  });

  describe("exportAsMarkdown", () => {
    it("includes title and messages", () => {
      const session = makeSession({
        messages: [makeMsg({ authorName: "User", content: "Hello" })],
      });
      const md = TimelineStore.exportAsMarkdown(session);
      expect(md).toContain("# Test Session");
      expect(md).toContain("You (Moderator)");
      expect(md).toContain("Hello");
    });

    it("includes participant info", () => {
      const session = makeSession();
      const md = TimelineStore.exportAsMarkdown(session);
      expect(md).toContain("deepseek-chat");
    });
  });

  describe("importFromJson", () => {
    it("imports valid session", () => {
      const session = makeSession();
      const json = JSON.stringify(session);
      const result = TimelineStore.importFromJson(json);
      expect(result).toEqual(session);
    });

    it("returns null for invalid JSON", () => {
      expect(TimelineStore.importFromJson("not-json")).toBeNull();
    });

    it("returns null for missing required fields", () => {
      expect(TimelineStore.importFromJson(JSON.stringify({ foo: "bar" }))).toBeNull();
    });
  });
});
