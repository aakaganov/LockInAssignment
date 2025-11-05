// src/concepts/friendGroup.ts

import { Db } from "npm:mongodb";

export interface FriendGroup {
  groupId: string;
  ownerId: string;
  groupName: string;
  confirmationRequired: boolean;
  members: string[];
  createdAt: Date;
}

// Utility to generate unique IDs
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new group in the database
 */
export async function createGroup(
  db: Db,
  ownerId: string,
  groupName: string,
  confirmationRequired: boolean,
  inviteUserIds: string[],
) {
  const groupId = generateId();
  const group: FriendGroup = {
    groupId,
    ownerId,
    groupName,
    confirmationRequired,
    members: [ownerId, ...inviteUserIds],
    createdAt: new Date(),
  };
  console.log("📦 Inserting new group:", group);
  await db.collection("groups").insertOne(group);
  console.log("✅ Group successfully inserted into DB");
  const inserted = await db.collection("groups").findOne({ groupId });
  console.log("Inserted group in DB:", inserted);
  return groupId;
}

/**
 * Add a member to a group
 */
export async function addMember(db: Db, groupId: string, userId: string) {
  const result = await db.collection("groups").updateOne(
    { groupId },
    { $addToSet: { members: userId } },
  );
  if (result.matchedCount === 0) {
    throw new Error(`Group ${groupId} does not exist`);
  }
}

/**
 * Remove a member from a group
 */
export async function removeMember(db: Db, groupId: string, userId: string) {
  const result = await db.collection("groups").updateOne(
    { groupId },
    { $pull: { members: userId as any } },
  );
  if (result.matchedCount === 0) {
    throw new Error(`Group ${groupId} does not exist`);
  }
}

/**
 * List all groups a user belongs to
 */
export async function listGroups(
  db: Db,
  userId: string,
): Promise<FriendGroup[]> {
  return db.collection<FriendGroup>("groups").find({
    members: { $in: [userId] },
  }).toArray();
}

/**
 * Update confirmation policy for a group
 */
export async function setConfirmationPolicy(
  db: Db,
  groupId: string,
  requiresConfirmation: boolean,
) {
  const result = await db.collection("groups").updateOne(
    { groupId },
    { $set: { confirmationRequired: requiresConfirmation } },
  );
  if (result.matchedCount === 0) {
    throw new Error(`Group ${groupId} does not exist`);
  }
}

/**
 * Delete a group (only creator can delete)
 */
export async function deleteGroup(db: Db, groupId: string, userId: string) {
  const group = await db.collection("groups").findOne({ groupId });
  if (!group) throw new Error("Group not found");

  if (group.ownerId !== userId) {
    throw new Error("Only the group creator can delete the group");
  }

  await db.collection("groups").deleteOne({ groupId });

  // Optionally, delete related notifications
  await db.collection("notifications").deleteMany({ groupId });
}
