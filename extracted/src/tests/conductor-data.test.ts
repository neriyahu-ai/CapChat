import { describe, it, expect } from "vitest";
import {
  modelById,
  roleColor,
  mockResponseFor,
  CONTEXT_WINDOW,
  ALL_MODELS,
  ROLE_PRESETS,
} from "../lib/conductor-data";

describe("ALL_MODELS", () => {
  it("includes deepseek-chat", () => {
    const m = ALL_MODELS.find((m) => m.id === "deepseek-chat");
    expect(m).toBeDefined();
    expect(m!.label).toBe("DeepSeek V4 Flash");
  });

  it("every model has required fields", () => {
    for (const m of ALL_MODELS) {
      expect(m.id).toBeTruthy();
      expect(m.label).toBeTruthy();
      expect(m.vendor).toBeTruthy();
      expect(m.accent).toContain("text-");
      expect(m.dot).toMatch(/^bg-/);
    }
  });
});

describe("modelById", () => {
  it("returns model info for known id", () => {
    const m = modelById("deepseek-chat");
    expect(m.label).toBe("DeepSeek V4 Flash");
    expect(m.vendor).toBe("DeepSeek");
  });

  it("returns fallback (first model) for unknown id", () => {
    const m = modelById("nonexistent-model-xyz");
    expect(m).toBeDefined();
  });
});

describe("roleColor", () => {
  it("returns a valid color string for any string input", () => {
    const color = roleColor("Agent Alpha");
    expect(color).toContain("border-");
    expect(color).toContain("bg-");
    expect(color).toContain("text-");
  });

  it("is deterministic: same input → same output", () => {
    expect(roleColor("foo")).toBe(roleColor("foo"));
    expect(roleColor("bar")).toBe(roleColor("bar"));
  });

  it("empty string returns valid color", () => {
    const color = roleColor("");
    expect(color).toBeTruthy();
  });

  it("different inputs can return same color (collision is fine)", () => {
    const result = roleColor("test");
    expect(result).toMatch(/^border-.+?\s+bg-.+?\s+text-.+?$/);
  });
});

describe("mockResponseFor", () => {
  it("returns array of strings", () => {
    const chunks = mockResponseFor("Skeptic", "gpt-4o");
    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    chunks.forEach((c) => expect(typeof c).toBe("string"));
  });

  it("all chunks have content", () => {
    const chunks = mockResponseFor("Hype", "claude-3.5-sonnet");
    chunks.forEach((c) => expect(c.trim().length).toBeGreaterThan(0));
  });
});

describe("CONTEXT_WINDOW", () => {
  it("is 9999", () => {
    expect(CONTEXT_WINDOW).toBe(9999);
  });
});

describe("ROLE_PRESETS", () => {
  it("contains expected presets", () => {
    expect(ROLE_PRESETS.length).toBeGreaterThanOrEqual(10);
    const skeptic = ROLE_PRESETS.find((r) => r.id === "skeptic");
    expect(skeptic).toBeDefined();
    expect(skeptic!.name).toBe("The Skeptic");
    expect(skeptic!.prompt).toContain("skeptic");
  });
});
