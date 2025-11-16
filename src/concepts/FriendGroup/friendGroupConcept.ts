// src/concepts/friendGroupConcept.ts
import {
  addMember as dbAddMember,
  createGroup as dbCreateGroup,
  deleteGroup as dbDeleteGroup,
  FriendGroup,
  GroupUser,
  listGroupsRaw,
  removeMember as dbRemoveMember,
  setConfirmationPolicy as dbSetConfirmationPolicy,
} from "./friendGroup.ts";
import { createNotification } from "../Notification/notification.ts";

export default class FriendGroupConcept {
  db: any;

  constructor(db: any) {
    this.db = db;
  }
  async createGroup(body: {
    ownerId: string;
    groupName: string;
    confirmationRequired: boolean;
    invitedEmails: string[];
  }): Promise<{ success: boolean; groupId: string; invitedUsers: string[] }> {
    const { ownerId, groupName, confirmationRequired, invitedEmails = [] } =
      body;
    const emailList = Array.isArray(invitedEmails) ? invitedEmails : [];

    // ✅ Fetch the owner's info so we can use their name in notifications
    const owner = await this.db.collection("users").findOne({
      userId: ownerId,
    });

    const groupId = await dbCreateGroup(
      this.db,
      ownerId,
      groupName,
      confirmationRequired,
      [],
    );

    const invitedUserIds: string[] = [];

    for (const email of emailList) {
      const invitedUser = await this.db.collection("users").findOne({ email });
      if (invitedUser) {
        invitedUserIds.push(invitedUser.userId);

        // ✅ Include full info so notifications always show correctly
        await createNotification(this.db, {
          userId: invitedUser.userId,
          type: "group_invite",
          message: `${
            owner?.name || "Someone"
          } invited you to join "${groupName}"`,
          groupId,
          fromUserId: ownerId,
          fromUserName: owner?.name || "Someone",
          groupName,
        });
      }
    }

    return { success: true, groupId, invitedUsers: invitedUserIds };
  }

  /**
  async createGroup(body: {
    ownerId: string;
    groupName: string;
    confirmationRequired: boolean;
    invitedEmails: string[];
  }): Promise<{ success: boolean; groupId: string; invitedUsers: string[] }> {
    const { ownerId, groupName, confirmationRequired, invitedEmails = [] } =
      body;
    const emailList = Array.isArray(invitedEmails) ? invitedEmails : [];

    const groupId = await dbCreateGroup(
      this.db,
      ownerId,
      groupName,
      confirmationRequired,
      [],
    );

    const invitedUserIds: string[] = [];
    for (const email of emailList) {
      const invitedUser = await this.db.collection("users").findOne({ email });
      if (invitedUser) {
        invitedUserIds.push(invitedUser.userId);
        await createNotification(this.db, {
          userId: invitedUser.userId,
          type: "group_invite",
          message: `You’ve been invited to join "${groupName}"`,
          groupId,
          fromUserId: ownerId,
        });
      }
    }
    return { success: true, groupId, invitedUsers: invitedUserIds };
  }
  */
  async inviteUserByEmail(
    body: { groupId: string; email: string; invitedBy: string },
  ) {
    const { groupId, email, invitedBy } = body;
    const group = await this.db.collection("groups").findOne({ groupId });
    if (!group) throw new Error("Group not found");

    const invitedUser = await this.db.collection("users").findOne({ email });
    if (!invitedUser) throw new Error("No user found with that email");

    const fromUser = await this.db.collection("users").findOne({
      userId: invitedBy,
    });
    const fromUserName = fromUser?.name || "Someone";

    await createNotification(this.db, {
      userId: invitedUser.userId,
      type: "group_invite",
      message: `${fromUserName} invited you to join "${group.groupName}"`,
      groupId,
      fromUserId: invitedBy,
      fromUserName,
      groupName: group.groupName,
    });

    return { success: true, invitedUserId: invitedUser.userId };
  }

  async acceptInvite(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;
    const group = await this.db.collection("groups").findOne({ groupId });
    if (!group) throw new Error("Group not found");
    if (group.members?.includes(userId)) return { success: true };
    await dbAddMember(this.db, groupId, userId);
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

  // ✅ Enriched listGroups with full user info, properly typed
  async listGroups(body: { userId: string }): Promise<FriendGroup[]> {
    const { userId } = body;
    const rawGroups = await listGroupsRaw(this.db, userId);

    // Collect all user IDs for lookup
    const allUserIds = Array.from(
      new Set(rawGroups.flatMap((g) => [g.ownerId, ...(g.members ?? [])])),
    );

    const users = await this.db.collection("users").find({
      userId: { $in: allUserIds },
    }).toArray();

    const userMap = new Map<string, GroupUser>();
    for (const u of users) {
      userMap.set(u.userId, {
        userId: u.userId,
        name: u.name ?? "Unknown",
        email: u.email ?? "—",
      });
    }

    // Construct typed FriendGroups
    const enrichedGroups: FriendGroup[] = rawGroups.map((g: any) => ({
      groupId: g.groupId,
      ownerId: g.ownerId,
      groupName: g.groupName,
      confirmationRequired: g.confirmationRequired,
      createdAt: g.createdAt,
      owner: userMap.get(g.ownerId) ?? {
        userId: g.ownerId,
        name: "Unknown",
        email: "—",
      },
      members: (g.members ?? []).map((id: string) =>
        userMap.get(id) ?? { userId: id, name: "Unknown", email: "—" }
      ),
    }));

    return enrichedGroups;
  }

  async setConfirmationPolicy(
    body: { groupId: string; requiresConfirmation: boolean },
  ) {
    const { groupId, requiresConfirmation } = body;
    await dbSetConfirmationPolicy(this.db, groupId, requiresConfirmation);
    return { success: true };
  }

  async deleteGroup(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;
    await dbDeleteGroup(this.db, groupId, userId);
    return { success: true, groupId };
  }
  // Inside FriendGroupConcept
  // In FriendGroupConcept.ts
  async leaveGroup(body: { groupId: string; userId: string }) {
    const { groupId, userId } = body;

    const group = await this.db.collection("groups").findOne({ groupId });
    if (!group) throw new Error("Group not found");

    // Remove from members
    await dbRemoveMember(this.db, groupId, userId);

    // Remove from rankings
    await this.db.collection("groups").updateOne(
      { groupId },
      { $pull: { rankedByTask: { userId }, rankedByTime: { userId } } },
    );

    // Remove group from user's groups list
    await this.db.collection("users").updateOne(
      { userId },
      { $pull: { groups: groupId } },
    );

    return { success: true, groupId, userId };
  }
}
