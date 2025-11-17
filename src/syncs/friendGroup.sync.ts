/**
 * FriendGroup synchronizations for excluded routes
 */

import { actions, Sync } from "@engine";
import { FriendGroup, Requesting } from "@concepts";

/** --- CREATE GROUP --- */
export const CreateGroupRequest: Sync = (
  { request, ownerId, groupName, confirmationRequired, invitedEmails },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/FriendGroup/createGroup",
      ownerId,
      groupName,
      confirmationRequired,
      invitedEmails,
    },
    { request },
  ]),
  then: actions([FriendGroup.createGroup, {
    ownerId,
    groupName,
    confirmationRequired,
    invitedEmails,
  }]),
});

export const CreateGroupResponse: Sync = (
  { request, groupId, invitedUsers },
) => ({
  when: actions([Requesting.request, { path: "/api/FriendGroup/createGroup" }, {
    request,
  }]),
  then: actions([Requesting.respond, { request, groupId, invitedUsers }]),
});

/** --- INVITE USER BY EMAIL --- */
export const InviteUserRequest: Sync = (
  { request, groupId, email, invitedBy },
) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/inviteUserByEmail", groupId, email, invitedBy },
    { request },
  ]),
  then: actions([FriendGroup.inviteUserByEmail, { groupId, email, invitedBy }]),
});

export const InviteUserResponse: Sync = ({ request, invitedUserId }) => ({
  when: actions([Requesting.request, {
    path: "/api/FriendGroup/inviteUserByEmail",
  }, { request }]),
  then: actions([Requesting.respond, { request, invitedUserId }]),
});

/** --- REMOVE MEMBER --- */
export const RemoveMemberRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/removeMember", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.removeMember, { groupId, userId }]),
});

export const RemoveMemberResponse: Sync = ({ request, success }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/removeMember" },
    { request },
  ]),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- SET CONFIRMATION POLICY --- */
export const SetConfirmationPolicyRequest: Sync = (
  { request, groupId, requiresConfirmation },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/api/FriendGroup/setConfirmationPolicy",
      groupId,
      requiresConfirmation,
    },
    { request },
  ]),
  then: actions([FriendGroup.setConfirmationPolicy, {
    groupId,
    requiresConfirmation,
  }]),
});

export const SetConfirmationPolicyResponse: Sync = ({ request, success }) => ({
  when: actions([Requesting.request, {
    path: "/api/FriendGroup/setConfirmationPolicy",
  }, { request }]),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- DELETE GROUP --- */
export const DeleteGroupRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/deleteGroup", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.deleteGroup, { groupId, userId }]),
});

export const DeleteGroupResponse: Sync = ({ request, success, groupId }) => ({
  when: actions([Requesting.request, { path: "/api/FriendGroup/deleteGroup" }, {
    request,
  }]),
  then: actions([Requesting.respond, { request, success, groupId }]),
});
