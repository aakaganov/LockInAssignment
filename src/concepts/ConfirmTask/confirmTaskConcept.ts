// src/concepts/ConfirmTask/confirmTaskConcept.ts
import {
  confirmTask,
  denyTask,
  finalizeConfirmation,
  getConfirmations,
  getPendingConfirmationsForPeer,
  requestConfirmation,
} from "../ConfirmTask/confirmTask.ts";

export default class ConfirmTaskConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Request peer confirmation for a completed task
   * POST /api/ConfirmTask/requestConfirmation
   */
  async requestConfirmation(body: {
    taskId: string;
    requestedBy: string;
    selectedPeerIds: string[];
    taskName: string;
    completionTime: number;
  }) {
    const { taskId, requestedBy, selectedPeerIds, taskName, completionTime } =
      body;
    return await requestConfirmation(
      this.db,
      taskId,
      requestedBy,
      undefined, // ✅ groupId placeholder
      selectedPeerIds.filter((peerId) => peerId !== requestedBy),
      completionTime,
      taskName,
    );
  }

  /**
   * Peer confirms a task
   */
  async confirmTask(body: { taskId: string; peerId: string }) {
    const { taskId, peerId } = body;
    await confirmTask(this.db, taskId, peerId);
    return { success: true };
  }

  /**
   * Finalize confirmation
   */
  async finalizeConfirmation(body: { taskId: string }) {
    const { taskId } = body;
    await finalizeConfirmation(this.db, taskId);
    return { success: true };
  }

  /**
   * Get confirmations requested by a user
   */
  async getConfirmations(body: { userId: string }) {
    const { userId } = body;
    return await getConfirmations(this.db, userId);
  }
  async denyTask(body: { taskId: string; peerId: string }) {
    const { taskId, peerId } = body;
    await denyTask(this.db, taskId, peerId);
    return { success: true };
  }
  async getPendingConfirmationsForPeer(body: { peerId: string }) {
    const { peerId } = body;
    return await getPendingConfirmationsForPeer(this.db, peerId);
  }
}
