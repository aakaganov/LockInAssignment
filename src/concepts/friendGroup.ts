// src/concepts/friendGroup.ts

export interface FriendGroup {
  groupId: string;
  name: string;
  members: Set<string>; // userIds
  requiresConfirmation: boolean;
}

// In-memory store for all groups
export const Groups = new Map<string, FriendGroup>();

// Utility to generate simple unique IDs
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new group
 */
export function createGroup(
  name: string,
  requiresConfirmation: boolean,
): string {
  const groupId = generateId();
  const newGroup: FriendGroup = {
    groupId,
    name,
    members: new Set(),
    requiresConfirmation,
  };
  Groups.set(groupId, newGroup);
  return groupId;
}

/**
 * Add a member to a group
 */
export function addMember(groupId: string, userId: string) {
  const group = Groups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);
  group.members.add(userId);
  Groups.set(groupId, group);
}

/**
 * Remove a member from a group
 */
export function removeMember(groupId: string, userId: string) {
  const group = Groups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);
  if (!group.members.has(userId)) {
    throw new Error(`User ${userId} is not a member of group ${groupId}`);
  }
  group.members.delete(userId);
  Groups.set(groupId, group);
}

/**
 * List all groups a user belongs to
 */
export function listGroups(userId: string): string[] {
  return Array.from(Groups.values())
    .filter((group) => group.members.has(userId))
    .map((group) => group.groupId);
}

/**
 * Update confirmation policy for a group
 */
export function setConfirmationPolicy(
  groupId: string,
  requiresConfirmation: boolean,
) {
  const group = Groups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);
  group.requiresConfirmation = requiresConfirmation;
  Groups.set(groupId, group);
}
