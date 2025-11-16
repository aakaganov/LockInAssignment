// src/concepts/notification.ts
import { Db } from "npm:mongodb";

/**
 Notification structure for app-wide notifications.
 - type now includes "task_confirmation" (used for task confirmation requests)
 - status uses "pending" | "accepted" | "declined" (matches frontend usage)
*/
export interface Notification {
  notificationId: string;
  userId: string; // who receives it
  // allow group invites, general info, warnings and task confirmations
  type: "group_invite" | "info" | "warning" | "task_confirmation";
  message: string;
  groupId?: string;
  fromUserId?: string;
  fromUserName?: string;
  groupName?: string;
  // use the same labels the frontend expects
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  extra?: { taskId?: string; [key: string]: any };
}

/** Utility to make unique IDs */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new notification
 * `data` may omit notificationId, createdAt and status (status defaults to "pending")
 */
export async function createNotification(
  db: Db,
  data: Omit<Notification, "notificationId" | "createdAt" | "status"> & {
    status?: Notification["status"];
  },
) {
  const notification: Notification = {
    notificationId: generateId(),
    createdAt: new Date(),
    status: data.status ?? "pending",
    ...data,
  };
  const result = await db.collection<Notification>("notifications").insertOne(
    notification,
  );
  console.log("Inserted notification result:", result);

  return notification;
}

/** Get all notifications for a specific user (most recent first) */
export async function listNotifications(db: Db, userId: string) {
  return db.collection<Notification>("notifications")
    .find({ userId, status: { $in: ["pending", "accepted", "declined"] } })
    .sort({ createdAt: -1 })
    .toArray();
}

/** Update notification status (accept, decline, etc.) */
export async function updateNotificationStatus(
  db: Db,
  notificationId: string,
  status: "pending" | "accepted" | "declined",
) {
  await db.collection<Notification>("notifications").updateOne(
    { notificationId },
    { $set: { status } },
  );

  if (status === "accepted" || status === "declined") {
    await db.collection<Notification>("notifications").deleteOne({
      notificationId,
    });
  }
}
/** Delete a notification */
export async function deleteNotification(db: Db, notificationId: string) {
  await db.collection<Notification>("notifications").deleteOne({
    notificationId,
  });
}
export async function resolveTaskNotifications(db: Db, taskId: string) {
  await db.collection<Notification>("notifications").updateMany(
    { "extra.taskId": taskId },
    { $set: { status: "accepted" } }, // mark resolved
  );
}
