// src/syncs/notification.sync.ts
import { actions, Sync } from "@engine";
import { Notification, Requesting } from "@concepts";

/** --- CREATE NOTIFICATION --- */
export const CreateNotificationRequest: Sync = (
  { request, userId, type, message, groupId, fromUserId },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/Notification/create",
      userId,
      type,
      message,
      groupId,
      fromUserId,
    },
    { request },
  ]),
  then: actions([
    Notification.create,
    { userId, type, message, groupId, fromUserId },
  ]),
});

export const CreateNotificationResponse: Sync = (
  { request, notification },
) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Notification/create" },
    { request },
  ]),
  then: actions([
    Requesting.respond,
    { request, notification },
  ]),
});

/** --- DELETE NOTIFICATION --- */
export const DeleteNotificationRequest: Sync = (
  { request, notificationId },
) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Notification/delete", notificationId },
    { request },
  ]),
  then: actions([
    Notification.delete,
    { notificationId },
  ]),
});

export const DeleteNotificationResponse: Sync = ({ request, success }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Notification/delete" },
    { request },
  ]),
  then: actions([
    Requesting.respond,
    { request, success },
  ]),
});
