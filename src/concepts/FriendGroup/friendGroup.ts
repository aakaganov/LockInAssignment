// src/concepts/friendGroup.ts
import { Db } from "npm:mongodb";

// Basic user info for group membership
export interface GroupUser {
  userId: string;
  name: string;
  email: string;
}

// Main friend group type (enriched)
export interface FriendGroup {
  groupId: string;
  ownerId: string;
  groupName: string;
  confirmationRequired: boolean;
  createdAt: Date;
  members: GroupUser[]; // full objects instead of just ids
  owner: GroupUser; // full owner info

  rankedByTask?: { userId: string; completedCount: number }[];
  rankedByTime?: { userId: string; completedHours: number }[];
}

function generateId(): string {
  return crypto.randomUUID();
}

/** Create a new group */
export async function createGroup(
  db: Db,
  ownerId: string,
  groupName: string,
  confirmationRequired: boolean,
  inviteUserIds: string[],
) {
  const groupId = generateId();
  const groupDoc = {
    groupId,
    ownerId,
    groupName,
    confirmationRequired,
    members: [ownerId, ...inviteUserIds],
    createdAt: new Date(),
  };
  await db.collection("groups").insertOne(groupDoc);
  return groupId;
}

/** Add member to group */
export async function addMember(db: Db, groupId: string, userId: string) {
  await db.collection("groups").updateOne(
    { groupId },
    { $addToSet: { members: userId } },
  );
}

/** Remove member from group */
export async function removeMember(db: Db, groupId: string, userId: string) {
  await db.collection("groups").updateOne(
    { groupId },
    { $pull: { members: userId as any } },
  );
}

/** Raw list query (returns plain DB groups with id arrays) */
export async function listGroupsRaw(db: Db, userId: string) {
  return db.collection("groups").find({ members: { $in: [userId] } }).toArray();
}

/** Update confirmation policy */
export async function setConfirmationPolicy(
  db: Db,
  groupId: string,
  requiresConfirmation: boolean,
) {
  await db.collection("groups").updateOne(
    { groupId },
    { $set: { confirmationRequired: requiresConfirmation } },
  );
}

/** Delete group (owner only) */
export async function deleteGroup(db: Db, groupId: string, userId: string) {
  const group = await db.collection("groups").findOne({ groupId });
  if (!group) throw new Error("Group not found");
  if (group.ownerId !== userId) {
    throw new Error("Only the group creator can delete the group");
  }
  await db.collection("groups").deleteOne({ groupId });
  await db.collection("notifications").deleteMany({ groupId });
}
