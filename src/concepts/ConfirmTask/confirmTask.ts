// src/concepts/ConfirmTask/confirmTask.ts
import { Db } from "npm:mongodb";
import { createNotification } from "../Notification/notification.ts";
import { getUser } from "../Account/account.ts";
import { resolveTaskNotifications } from "../Notification/notification.ts";
import { Tasks } from "../Task/task.ts"; // in-memory map (we'll update when confirming)
import LeaderboardConcept from "../Leaderboard/leaderboardConcept.ts";
import { getGroupStats } from "../Leaderboard/leaderboard.ts";
import { updateLeaderboardsForUser } from "../Leaderboard/leaderboard.ts";

/** TaskStatus update will rely on task module having 'confirmed' added (see task.ts). */

export type ConfirmationStatus = "pending" | "verified" | "declined";

export interface Confirmation {
  confirmationId: string;
  taskId: string;
  requestedBy: string;
  sentTo: string[]; // NEW: list of intended recipients
  confirmedBy: string[];
  deniedBy: string[];
  status: ConfirmationStatus;
  createdAt: Date;
  taskName?: string;
  actualTime?: number;
}

/** Utility to make unique IDs */
function generateId(): string {
  return crypto.randomUUID();
}

export async function requestConfirmation(
  db: Db,
  taskId: string,
  requestedBy: string,
  groupId?: string,
  selectedPeerIds: string[] = [],
  actualTime: number = 0,
  taskName: string = "task",
) {
  if (!taskId || !requestedBy) {
    throw new Error("taskId and requestedBy required");
  }

  if (!selectedPeerIds.length) {
    throw new Error("No peers selected for confirmation notification");
  }

  console.log("🟡 Incoming requestConfirmation:", {
    taskId,
    requestedBy,
    groupId,
    selectedPeerIds,
    actualTime,
    taskName,
  });

  // remove existing task_confirmation notifications for the task
  /**
  await db.collection("notifications").deleteMany({
    type: "task_confirmation",
    "extra.taskId": taskId,
  });
   */
  // filter recipients (dedupe and exclude sender)
  const peerIds = Array.from(
    new Set(selectedPeerIds.filter((id) => id && id !== requestedBy)),
  );
  console.log(
    "Filtered peerIds (excluding sender):",
    peerIds,
    "requestedBy:",
    requestedBy,
  );

  if (peerIds.length === 0) {
    console.warn("⚠️ No valid peers to notify for this task:", taskId);
    return { success: false, reason: "No valid peers" };
  }

  // insert confirmation doc including sentTo
  await db.collection("confirmations").deleteMany({ taskId });
  await db.collection("notifications").deleteMany({
    type: "task_confirmation",
    "extra.taskId": taskId,
  });
  const confirmation: Confirmation = {
    confirmationId: generateId(),
    taskId,
    requestedBy,
    sentTo: peerIds,
    confirmedBy: [],
    deniedBy: [],
    status: "pending",
    createdAt: new Date(),
    taskName,
    actualTime,
  };
  await db.collection<Confirmation>("confirmations").insertOne(confirmation);

  // try to resolve sender name for the notification
  let senderName = "Unknown User";
  try {
    const sender = await getUser(requestedBy);
    if (sender?.name) senderName = sender.name;
  } catch (err) {
    console.warn("Could not fetch sender name:", err);
  }

  const message =
    `Please confirm completion of "${taskName}" (took ${actualTime} mins).`;

  // create one notification per intended recipient
  for (const peerId of peerIds) {
    console.log(
      `📨 Creating notification for peer ${peerId} from ${requestedBy}`,
    );
    await createNotification(db, {
      userId: peerId,
      type: "task_confirmation",
      message,
      fromUserId: requestedBy,
      fromUserName: senderName,
      status: "pending",
      extra: { taskId, taskName, actualTime },
    });
  }

  // debug output
  const notifs = await db.collection("notifications")
    .find({ "extra.taskId": taskId })
    .toArray();
  console.log("✅ All task_confirmation notifications for this task:", notifs);
  console.log("requestedBy:", requestedBy);
  console.log("selectedPeerIds:", selectedPeerIds);
  console.log("peerIds after filtering:", peerIds);
  console.log("✅ Created confirmation and notifications:", {
    confirmation,
    notifs,
    peerIds,
  });
  return { success: true, confirmationId: confirmation.confirmationId };
}

/** Peer confirms a task */
export async function confirmTask(db: Db, taskId: string, peerId: string) {
  console.log("DB collections:", await db.listCollections().toArray());

  const confirmation = await db.collection<Confirmation>("confirmations")
    .findOne({ taskId });

  if (!confirmation) {
    return { success: false, message: "Confirmation not found" };
  }

  // add peer to confirmedBy and set status verified
  await db.collection<Confirmation>("confirmations").updateOne(
    { taskId },
    { $addToSet: { confirmedBy: peerId }, $set: { status: "verified" } },
  );

  // mark the notification(s) for that peer as accepted
  await db.collection("notifications").updateMany(
    { userId: peerId, type: "task_confirmation", "extra.taskId": taskId },
    { $set: { status: "accepted" } },
  );

  // mark task as confirmed in tasks collection (persisted)
  try {
    await db.collection("tasks").updateOne({ taskId }, {
      $set: { status: "confirmed" },
    });
    // also update in-memory map if present
    const inMem = Tasks.get(taskId);
    if (inMem) {
      inMem.status = "confirmed" as any;
      Tasks.set(taskId, inMem);
    }
  } catch (err) {
    console.warn("Failed to update task status to confirmed:", err);
  }
  // UPDATE USER CONFIRMED STATS
  try {
    const task = await db.collection("tasks").findOne({ taskId });

    if (task && typeof task.actualTime === "number") {
      await db.collection("users").updateOne(
        { userId: task.ownerId },
        {
          $inc: {
            confirmedTasksCompleted: 1,
            confirmedMinutesCompleted: task.actualTime,
          },
        },
      );
    } else {
      console.warn("Task missing actualTime for stats update:", taskId);
    }
  } catch (err) {
    console.error("Failed to update user confirmation stats:", err);
  }

  // resolve other task notifications and cleanup
  await resolveTaskNotifications(db, taskId);
  await db.collection("notifications").deleteMany({
    type: "task_confirmation",
    "extra.taskId": taskId,
  });
  await db.collection("confirmations").deleteOne({ taskId });
  await db.collection("notifications").deleteMany({
    type: "task_confirmation",
    "extra.taskId": taskId,
  });
  const task = await db.collection("tasks").findOne({ taskId });
  if (!task) throw new Error(`Task ${taskId} not found`);
  const groups = await db.collection("groups").find({ members: task.ownerId })
    .toArray();
  for (const group of groups) {
    if (group.confirmationRequired) {
      await new LeaderboardConcept(db).recordCompletion({
        userId: task.ownerId,
        actualTime: task.actualTime!,
        groupId: group.groupId,
        confirmed: true,
      });
    }
  }
  await updateLeaderboardsForUser(db, task.ownerId);

  return { success: true };
}

/** Finalize confirmation once any peer confirms */
export async function finalizeConfirmation(db: Db, taskId: string) {
  await db.collection<Confirmation>("confirmations").updateOne(
    { taskId },
    { $set: { status: "verified" } },
  );
}

/** Get all confirmations requested by a user */
export async function getConfirmations(db: Db, userId: string) {
  return db.collection<Confirmation>("confirmations").find({
    requestedBy: userId,
  }).toArray();
}

export async function denyTask(db: Db, taskId: string, peerId: string) {
  const confirmation = await db.collection<Confirmation>("confirmations")
    .findOne({ taskId });
  if (!confirmation) {
    return { success: false, message: "Confirmation not found" };
  }

  await db.collection<Confirmation>("confirmations").updateOne(
    { taskId },
    { $addToSet: { deniedBy: peerId }, $set: { status: "declined" } },
  );
  await db.collection("notifications").updateMany(
    { userId: peerId, type: "task_confirmation", "extra.taskId": taskId },
    { $set: { status: "declined" } },
  );

  await resolveTaskNotifications(db, taskId);
  await db.collection("notifications").deleteMany({
    type: "task_confirmation",
    "extra.taskId": taskId,
  });
  return { success: true };
}

/** Return only confirmations that were SENT to the peer (and are still pending for them) */
export async function getPendingConfirmationsForPeer(db: Db, peerId: string) {
  return db.collection<Confirmation>("confirmations").find({
    sentTo: { $in: [peerId] }, // <- only those sent to this peer
    confirmedBy: { $ne: peerId }, // not yet confirmed by them
    deniedBy: { $ne: peerId }, // not yet denied by them
    status: "pending",
  }).toArray();
}
