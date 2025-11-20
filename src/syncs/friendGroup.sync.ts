/**
 * FriendGroup synchronizations
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
      path: "/FriendGroup/createGroup",
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
/** --- CREATE GROUP RESPONSE --- */
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
    { path: "/FriendGroup/inviteUserByEmail", groupId, email, invitedBy },
    { request },
  ]),
  then: actions([FriendGroup.inviteUserByEmail, { groupId, email, invitedBy }]),
});

/** --- ACCEPT INVITE --- */
export const AcceptInviteRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/acceptInvite", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.acceptInvite, { groupId, userId }]),
});

/** --- DECLINE INVITE --- */
export const DeclineInviteRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/declineInvite", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.declineInvite, { groupId, userId }]),
});

/** --- REMOVE MEMBER --- */
export const RemoveMemberRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/removeMember", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.removeMember, { groupId, userId }]),
});

/** --- SET CONFIRMATION POLICY --- */
export const SetConfirmationPolicyRequest: Sync = (
  { request, groupId, requiresConfirmation },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/FriendGroup/setConfirmationPolicy",
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

/** --- DELETE GROUP --- */
export const DeleteGroupRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/deleteGroup", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.deleteGroup, { groupId, userId }]),
});

/** --- LEAVE GROUP --- */
export const LeaveGroupRequest: Sync = ({ request, groupId, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/leaveGroup", groupId, userId },
    { request },
  ]),
  then: actions([FriendGroup.leaveGroup, { groupId, userId }]),
});

/** --- LIST GROUPS --- */
export const ListGroupsRequest: Sync = ({ request, userId }) => ({
  when: actions([
    Requesting.request,
    { path: "/FriendGroup/listGroups", userId },
    { request },
  ]),
  then: actions([FriendGroup.listGroups, { userId }]),
});
