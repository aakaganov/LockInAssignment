// src/syncs/account.sync.ts
import { actions, Sync } from "@engine";
import { Account, Requesting } from "@concepts";

/** --- UPDATE USER --- */
export const UpdateUserRequest: Sync = (
  { request, userId, name, email, password },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Account/updateUser", userId, name, email, password },
    { request },
  ]),
  then: actions([Account.updateUser, { userId, name, email, password }]),
});

export const UpdateUserResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/Account/updateUser" }, { request }],
    [Account.updateUser, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/** --- DELETE USER --- */
export const DeleteUserRequest: Sync = ({ request, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/Account/deleteUser", userId },
    { request },
  ]),
  then: actions([Account.deleteUser, { userId }]),
});

export const DeleteUserResponse: Sync = ({ request, message }) => ({
  when: actions(
    [Requesting.request, { path: "/Account/deleteUser" }, { request }],
    [Account.deleteUser, {}, { message }],
  ),
  then: actions([Requesting.respond, { request, message }]),
});
