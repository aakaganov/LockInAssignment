export type ConfirmationStatus = "pending" | "verified";

export interface Confirmation {
  taskId: string;
  requestedBy: string;
  confirmedBy: Set<string>;
  status: ConfirmationStatus;
}

// In-memory confirmation store
export const Confirmations = new Map<string, Confirmation>();

/**
 * Request peer confirmation for a completed task
 */
export function requestConfirmation(taskId: string, requestedBy: string) {
  if (!taskId) throw new Error("taskId is required");
  if (!requestedBy) throw new Error("requestedBy is required");

  if (Confirmations.has(taskId)) {
    throw new Error(`Confirmation already requested for task ${taskId}`);
  }

  const newConfirmation: Confirmation = {
    taskId,
    requestedBy,
    confirmedBy: new Set(),
    status: "pending",
  };

  Confirmations.set(taskId, newConfirmation);
}

/**
 * Peer confirms a task
 */
export function confirmTask(taskId: string, peerId: string) {
  const confirmation = Confirmations.get(taskId);
  if (!confirmation) {
    throw new Error(`No confirmation exists for task ${taskId}`);
  }

  confirmation.confirmedBy.add(peerId);
  Confirmations.set(taskId, confirmation);
}

/**
 * Finalize confirmation if at least one peer has confirmed
 */
export function finalizeConfirmation(taskId: string) {
  const confirmation = Confirmations.get(taskId);
  if (!confirmation) {
    throw new Error(`No confirmation exists for task ${taskId}`);
  }
  if (confirmation.confirmedBy.size === 0) {
    throw new Error(
      `Cannot finalize confirmation: no peers have confirmed task ${taskId}`,
    );
  }

  confirmation.status = "verified";
  Confirmations.set(taskId, confirmation);
}

/**
 * List all confirmations requested by a user
 */
export function getConfirmations(userId: string): Confirmation[] {
  return Array.from(Confirmations.values()).filter((c) =>
    c.requestedBy === userId
  );
}
