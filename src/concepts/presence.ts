// -----------------------------------------------------------
// Concept: Presence
// Purpose: Track and share users’ online presence (active/inactive) within peer groups
// Principle: Supports accountability and connectedness
// -----------------------------------------------------------

export interface User {
  userId: string;
  lastActive: Date | null;
  peerGroup: Set<string>;
  active: boolean;
}

const users = new Map<string, User>();

// ----- Actions -----

/**
 * addUser(userId: string)
 * Requires: userId not already in Users
 * Effects: Creates user with no peers and no recorded activity.
 */
export function addUser(userId: string): void {
  if (users.has(userId)) {
    throw new Error(`User ${userId} already exists.`);
  }
  users.set(userId, {
    userId,
    lastActive: null,
    peerGroup: new Set(),
    active: true,
  });
  console.log(`[Presence] Added user ${userId}`);
}

/**
 * heartbeat(userId: string)
 * Requires: user exists
 * Effects: Updates lastActive[userId] = now
 */
export function heartbeat(userId: string): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);
  user.lastActive = new Date();
  user.active = true;
  console.log(`[Presence] Heartbeat for ${userId} at ${user.lastActive}`);
}

/**
 * markInactive(userId: string, thresholdMs: number)
 * Requires: user exists, time since lastActive > threshold
 * Effects: Marks user inactive and triggers notifyPeers
 */
export function markInactive(userId: string, thresholdMs: number): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);
  if (!user.lastActive) {
    throw new Error(`User ${userId} has no recorded activity.`);
  }

  const elapsed = Date.now() - user.lastActive.getTime();
  if (elapsed <= thresholdMs) {
    throw new Error(`User ${userId} is still active (elapsed ${elapsed}ms).`);
  }

  user.active = false;
  console.log(`[Presence] Marked ${userId} as inactive.`);
  notifyPeers(userId);
}

/**
 * notifyPeers(userId: string)
 * Requires: user exists
 * Effects: Sends notification to all peers in peerGroup[userId]
 */
export function notifyPeers(userId: string): void {
  const user = users.get(userId);
  if (!user) throw new Error(`User ${userId} does not exist.`);

  for (const peerId of user.peerGroup) {
    console.log(`[Presence] Notifying ${peerId} that ${userId} is inactive`);
    // Here you could integrate with real notification system
  }
}

/**
 * addPeer(userId: string, peerId: string)
 * Requires: both users exist
 * Effects: Adds peerId to peerGroup[userId]
 */
export function addPeer(userId: string, peerId: string): void {
  const user = users.get(userId);
  const peer = users.get(peerId);
  if (!user || !peer) {
    throw new Error(
      `Both users must exist. Missing: ${!user ? userId : ""} ${
        !peer ? peerId : ""
      }`,
    );
  }
  user.peerGroup.add(peerId);
  console.log(`[Presence] Added ${peerId} to ${userId}'s peer group`);
}

// ----- Queries -----

export function getUser(userId: string): User | undefined {
  return users.get(userId);
}

export function listUsers(): User[] {
  return Array.from(users.values());
}

// ----- Demo -----
if (import.meta.main) {
  addUser("alice");
  addUser("bob");
  addPeer("alice", "bob");

  heartbeat("alice");

  setTimeout(() => {
    markInactive("alice", 1000); // threshold: 1 second
  }, 1500);
}
