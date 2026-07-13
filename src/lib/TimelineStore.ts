import type { Session, Message } from "./conductor-types";
import { CONTEXT_WINDOW } from "./conductor-data";
import { reportFallback } from "./fallback-logger";

const STORAGE_KEY = "conductor-sessions";

export class TimelineStore {
  static save(sessions: Session[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      reportFallback({ from: "TimelineStore.save", what: "localStorage.setItem failed", reason: "Storage may be full or unavailable", error: e });
    }
  }

  static load(): Session[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Session[];
    } catch (e) {
      reportFallback({ from: "TimelineStore.load", what: "JSON.parse failed", reason: "Corrupt localStorage data", error: e });
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      reportFallback({ from: "TimelineStore.clear", what: "localStorage.removeItem failed", reason: "Storage unavailable", error: e });
    }
  }

  static getContext(messages: Message[]): Message[] {
    return messages.slice(-CONTEXT_WINDOW);
  }

  static totalTokens(messages: Message[]): number {
    return messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
  }

  static contextUtilization(messages: Message[]): number {
    return Math.min(100, (this.totalTokens(messages) / CONTEXT_WINDOW) * 100);
  }

  static exportAsJson(session: Session): string {
    return JSON.stringify(session, null, 2);
  }

  static exportAsMarkdown(session: Session): string {
    const lines: string[] = [];
    lines.push(`# ${session.title}`);
    lines.push(`*Exported: ${new Date().toISOString()}*`);
    lines.push("");
    lines.push(`**Participants:** ${session.participants.map((p) => `${p.roleName} (${p.model})`).join(", ")}`);
    lines.push("---");
    lines.push("");

    for (const msg of session.messages) {
      const author = msg.sender === "user" ? "You (Moderator)" : `${msg.authorName}${msg.roleName ? ` (${msg.roleName})` : ""}`;
      lines.push(`**${author}:**`);
      lines.push(msg.content);
      lines.push("");
    }

    return lines.join("\n");
  }

  static importFromJson(json: string): Session | null {
    try {
      const session = JSON.parse(json) as Session;
      if (!session.id || !session.messages || !session.participants) {
        reportFallback({ from: "TimelineStore.importFromJson", what: "Invalid session structure", reason: `Missing id/messages/participants in "${json.slice(0, 100)}"` });
        return null;
      }
      return session;
    } catch (e) {
      reportFallback({ from: "TimelineStore.importFromJson", what: "JSON.parse failed", reason: "Invalid JSON input", error: e });
      return null;
    }
  }
}
