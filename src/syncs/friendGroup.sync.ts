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
  when: actions([FriendGroup.createGroup, { groupId, invitedUsers }]),
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
  when: actions([FriendGroup.inviteUserByEmail, { invitedUserId }]),
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
  when: actions([FriendGroup.removeMember, { success }]),
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
  when: actions([FriendGroup.setConfirmationPolicy, { success }]),
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
  when: actions([FriendGroup.deleteGroup, { success, groupId }]),
  then: actions([Requesting.respond, { request, success, groupId }]),
});

/** --- ACCEPT INVITE --- */
export const AcceptInviteRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/acceptInvite", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.acceptInvite, { groupId, userId }]),
});

export const AcceptInviteResponse: Sync = ({ request, groupId, userId }) => ({
  when: actions([FriendGroup.acceptInvite, { groupId, userId }]),
  then: actions([Requesting.respond, { request, groupId, userId }]),
});

/** --- DECLINE INVITE --- */
export const DeclineInviteRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/declineInvite", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.declineInvite, { groupId, userId }]),
});

export const DeclineInviteResponse: Sync = ({ request, success }) => ({
  when: actions([FriendGroup.declineInvite, { success }]),
  then: actions([Requesting.respond, { request, success }]),
});

/** --- LEAVE GROUP --- */
export const LeaveGroupRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/api/FriendGroup/leaveGroup", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.leaveGroup, { groupId, userId }]),
});

export const LeaveGroupResponse: Sync = ({ request, groupId, userId }) => ({
  when: actions([FriendGroup.leaveGroup, { groupId, userId }]),
  then: actions([Requesting.respond, { request, groupId, userId }]),
});
