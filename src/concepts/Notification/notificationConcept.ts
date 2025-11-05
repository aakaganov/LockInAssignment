// src/concepts/notificationConcept.ts
import {
  createNotification,
  deleteNotification,
  listNotifications,
  updateNotificationStatus,
} from "./notification.ts";
import { addMember } from "../FriendGroup/friendGroup.ts";
export default class NotificationConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  /** POST /api/Notification/create */
  async create(body: {
    userId: string;
    type: "group_invite" | "info" | "warning";
    message: string;
    groupId?: string;
    fromUserId?: string;
  }) {
    const notification = await createNotification(this.db, body);
    return { success: true, notification };
  }

  /** POST /api/Notification/list */
  async list(body: { userId: string }) {
    const notifications = await listNotifications(this.db, body.userId);
    return { success: true, notifications };
  }

  /** POST /api/Notification/updateStatus */
  async updateStatus(body: {
    notificationId: string;
    status: "accepted" | "rejected";
  }) {
    const { notificationId, status } = body;

    const notif = await this.db.collection("notifications").findOne({
      notificationId,
    });

    if (!notif) return { success: false, message: "Notification not found" };

    await updateNotificationStatus(this.db, notificationId, status);

    // ✅ If accepted and it’s a group invite, add the user to the group
    if (
      status === "accepted" && notif.type === "group_invite" && notif.groupId
    ) {
      await addMember(this.db, notif.groupId, notif.userId);
    }

    return { success: true };
  }

  /** POST /api/Notification/delete */
  async delete(body: { notificationId: string }) {
    await deleteNotification(this.db, body.notificationId);
    return { success: true };
  }
}
