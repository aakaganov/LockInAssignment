// src/concepts/friendGroupConcept.ts
import {
  addMember as dbAddMember,
  createGroup as dbCreateGroup,
  deleteGroup as dbDeleteGroup,
  FriendGroup,
  listGroups as dbListGroups,
  removeMember as dbRemoveMember,
  setConfirmationPolicy as dbSetConfirmationPolicy,
} from "./friendGroup.ts";

import { createNotification } from "../Notification/notification.ts";

export default class FriendGroupConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }

  // ✅ Modified to send group invites by email
  async createGroup(body: {
    ownerId: string;
    groupName: string;
    confirmationRequired: boolean;
    invitedEmails: string[]; // changed to invited emails instead of members
  }): Promise<{ success: boolean; groupId: string; invitedUsers: string[] }> {
    const {
      ownerId,
      groupName,
      confirmationRequired,
      invitedEmails = [],
    } = body;

    // Defensive check
    if (!Array.isArray(invitedEmails)) {
      console.warn("⚠️ invitedEmails is not an array, defaulting to []");
    }
    const emailList = Array.isArray(invitedEmails) ? invitedEmails : [];

    // 1️⃣ Create the group in DB with only the owner
    const groupId = await dbCreateGroup(
      this.db,
      ownerId,
      groupName,
      confirmationRequired,
      [], // no members yet
    );

    // 2️⃣ For each invited email, find user in DB
    const invitedUserIds: string[] = [];

    for (const email of emailList) {
      const invitedUser = await this.db.collection("users").findOne({ email });
      if (invitedUser) {
        invitedUserIds.push(invitedUser.userId);

        // 3️⃣ Create a notification for the invited user
        await createNotification(this.db, {
          userId: invitedUser.userId,
          type: "group_invite",
          message: `You’ve been invited to join "${groupName}"`,
          groupId,
          fromUserId: ownerId,
        });
      } else {
        console.warn(`⚠️ No user found with email ${email}`);
      }
    }

    return { success: true, groupId, invitedUsers: invitedUserIds };
  }

  // 📩 Invite user to group (does NOT add them yet)
  async inviteUserByEmail(
    body: { groupId: string; email: string; invitedBy: string },
  ) {
    const { groupId, email, invitedBy } = body;

    const group = await this.db.collection("groups").findOne({ groupId });
    if (!group) throw new Error("Group not found");

    const invitedUser = await this.db.collection("users").findOne({ email });
    if (!invitedUser) throw new Error("No user found with that email");

    // 🔔 Create a notification for that user
    await createNotification(this.db, {
      userId: invitedUser.userId,
      type: "group_invite",
      message: `You’ve been invited to join group "${group.groupName}"`,
      groupId,
      fromUserId: invitedBy,
    });

    return { success: true, invitedUserId: invitedUser.userId };
  }

  // ✅ User accepts the group invite
  async acceptInvite(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;

    // Check if already a member
    const group = await this.db.collection("groups").findOne({ groupId });
    if (!group) throw new Error("Group not found");
    if (group.members?.includes(userId)) return { success: true }; // already added

    // Add to members
    await dbAddMember(this.db, groupId, userId);

    // Optionally: delete the notification or mark as "accepted"
    await this.db.collection("notifications").updateMany(
      { groupId, userId, type: "group_invite" },
      { $set: { status: "accepted" } },
    );

    return { success: true, groupId, userId };
  }

  async declineInvite(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;

    await this.db.collection("notifications").updateMany(
      { groupId, userId, type: "group_invite" },
      { $set: { status: "declined" } },
    );

    return { success: true };
  }

  async removeMember(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;
    await dbRemoveMember(this.db, groupId, userId);
    return { success: true };
  }

  async listGroups(body: { userId: string }): Promise<FriendGroup[]> {
    const { userId } = body;
    const groups = await dbListGroups(this.db, userId);

    console.log("Groups from DB:", groups); // <-- check that groupName exists

    // Map explicitly to ensure groupName is included
    return groups.map((g) => ({
      groupId: g.groupId,
      groupName: g.groupName, // make sure this is here
      ownerId: g.ownerId,
      confirmationRequired: g.confirmationRequired,
      members: g.members,
      createdAt: g.createdAt,
    }));
  }

  async setConfirmationPolicy(
    body: { groupId: string; requiresConfirmation: boolean },
  ) {
    const { groupId, requiresConfirmation } = body;
    await dbSetConfirmationPolicy(this.db, groupId, requiresConfirmation);
    return { success: true };
  }
  async deleteGroup(body: { groupId: string; userId: string }) {
    console.log("Backend deleteGroup called with:", body);
    const { groupId, userId } = body;
    await dbDeleteGroup(this.db, groupId, userId);
    console.log("Backend deleteGroup success");
    return { success: true, groupId };
  }
}
