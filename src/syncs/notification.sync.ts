// src/syncs/notification.sync.ts
import { actions, Sync } from "@engine";
import { Notification, Requesting } from "@concepts";

/** --- CREATE NOTIFICATION --- */
export const CreateNotificationRequest: Sync = (
  { request, userId, type, message, groupId },
) => ({
  when: actions([
    Requesting.request,
    { path: "/api/Notification/create", userId, type, message, groupId },
    { request },
  ]),
  then: actions([Notification.create, { userId, type, message, groupId }]),
});

export const CreateNotificationResponse: Sync = (
  { request, notification },
) => ({
  when: actions(
    [Requesting.request, { path: "/api/Notification/create" }, { request }],
    [Notification.create, {}, { notification }],
  ),
  then: actions([Requesting.respond, { request, notification }]),
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
  then: actions([Notification.delete, { notificationId }]),
});

export const DeleteNotificationResponse: Sync = ({ request, success }) => ({
  when: actions(
    [Requesting.request, { path: "/api/Notification/delete" }, { request }],
    [Notification.delete, {}, { success }],
  ),
  then: actions([Requesting.respond, { request, success }]),
});
