// src/concepts/notification.ts
import { Db } from "npm:mongodb";

export interface Notification {
  notificationId: string;
  userId: string; // who receives it
  type: "group_invite" | "info" | "warning";
  message: string;
  groupId?: string;
  fromUserId?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

/** Utility to make unique IDs */
function generateId(): string {
  return crypto.randomUUID();
}

/** Create a new notification */
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

  await db.collection<Notification>("notifications").insertOne(notification);
  return notification;
}

/** Get all notifications for a specific user */
export async function listNotifications(db: Db, userId: string) {
  return db.collection<Notification>("notifications")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

/** Update notification status (accept, reject, etc.) */
export async function updateNotificationStatus(
  db: Db,
  notificationId: string,
  status: "accepted" | "rejected",
) {
  await db.collection<Notification>("notifications").updateOne(
    { notificationId },
    { $set: { status } },
  );
}

/** Delete a notification */
export async function deleteNotification(db: Db, notificationId: string) {
  await db.collection<Notification>("notifications").deleteOne({
    notificationId,
  });
}
