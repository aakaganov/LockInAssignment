// src/concepts/ConfirmTask/confirmTaskConcept.ts
import {
  Confirmations,
  confirmTask,
  finalizeConfirmation,
  getConfirmations,
  requestConfirmation,
} from "../ConfirmTask/confirmTask.ts"; // use the exact same casing as other imports

export default class ConfirmTaskConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Request peer confirmation for a completed task
   * POST /api/ConfirmTask/requestConfirmation
   */
  async requestConfirmation(body: { taskId: string; requestedBy: string }) {
    const { taskId, requestedBy } = body;
    requestConfirmation(taskId, requestedBy);
    return { success: true };
  }

  /**
   * Peer confirms a task
   * POST /api/ConfirmTask/confirmTask
   */
  async confirmTask(body: { taskId: string; peerId: string }) {
    const { taskId, peerId } = body;
    confirmTask(taskId, peerId);
    return { success: true };
  }

  /**
   * Finalize confirmation once at least one peer has confirmed
   * POST /api/ConfirmTask/finalizeConfirmation
   */
  async finalizeConfirmation(body: { taskId: string }) {
    const { taskId } = body;
    finalizeConfirmation(taskId);
    return { success: true };
  }

  /**
   * Get all confirmations requested by a user
   * POST /api/ConfirmTask/getConfirmations
   */
  async getConfirmations(body: { userId: string }) {
    const { userId } = body;
    const confirmations = getConfirmations(userId) || [];

    // Convert Sets to arrays for JSON serialization
    const result = confirmations.map((c) => ({
      ...c,
      confirmedBy: Array.from(c.confirmedBy ?? []),
    }));

    // Always return a valid JSON array
    return result ?? [];
  }
}
