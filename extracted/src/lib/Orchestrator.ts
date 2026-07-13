import type { Participant, Message } from "./conductor-types";

export type OrchestratorState = {
  isAutorun: boolean;
  currentTurnIndex: number;
};

export type OrchestratorEvent =
  | { type: "START_AUTORUN"; participants: Participant[] }
  | { type: "STOP_AUTORUN" }
  | { type: "TRIGGER_MANUAL"; participantId: string }
  | { type: "TURN_COMPLETE" }
  | { type: "PASS_COMPLETE" };

export class Orchestrator {
  private state: OrchestratorState;
  private queue: Participant[] = [];

  constructor() {
    this.state = { isAutorun: false, currentTurnIndex: 0 };
  }

  getState(): OrchestratorState {
    return { ...this.state };
  }

  getQueue(): Participant[] {
    return [...this.queue];
  }

  dispatch(event: OrchestratorEvent): OrchestratorState {
    switch (event.type) {
      case "START_AUTORUN": {
        const enabled = event.participants.filter((p) => p.isEnabled);
        if (enabled.length === 0) return this.state;
        this.queue = enabled;
        this.state = { isAutorun: true, currentTurnIndex: 0 };
        return this.state;
      }

      case "STOP_AUTORUN": {
        this.queue = [];
        this.state = { isAutorun: false, currentTurnIndex: 0 };
        return this.state;
      }

      case "TRIGGER_MANUAL": {
        const idx = this.queue.findIndex((p) => p.id === event.participantId);
        if (idx !== -1) {
          this.state = { ...this.state, currentTurnIndex: idx };
        }
        return this.state;
      }

      case "TURN_COMPLETE": {
        const nextIndex = this.state.currentTurnIndex + 1;
        if (nextIndex >= this.queue.length) {
          return this.dispatch({ type: "PASS_COMPLETE" });
        }
        this.state = { ...this.state, currentTurnIndex: nextIndex };
        return this.state;
      }

      case "PASS_COMPLETE": {
        this.queue = [];
        this.state = { isAutorun: false, currentTurnIndex: 0 };
        return this.state;
      }

      default:
        return this.state;
    }
  }

  currentParticipant(): Participant | null {
    if (this.queue.length === 0) return null;
    return this.queue[this.state.currentTurnIndex] ?? null;
  }

  isRunning(): boolean {
    return this.state.isAutorun;
  }
}
