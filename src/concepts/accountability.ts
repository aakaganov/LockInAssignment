// -----------------------------------------------------------
// Concept: Accountability
// Purpose: Encourage healthy digital habits via peer tracking.
// -----------------------------------------------------------

// ----- Types -----
export interface User {
  userId: string;
  screenTime: number; // minutes today
  sharedPeers: Set<string>; // IDs of peers they share with
}

// In-memory state (would later move to persistent storage)
const users = new Map<string, User>();

// ----- Actions -----

/**
 * addUser(userId: string)
 * Requires: userId not already in users
 * Effects: creates a new user with 0 screenTime and empty sharedPeers
 */
export function addUser(userId: string): void {
  if (users.has(userId)) {
    throw new Error(`User ${userId} already exists.`);
  }
  users.set(userId, {
    userId,
    screenTime: 0,
    sharedPeers: new Set(),
  });
}

/**
 * updateScreenTime(userId: string, minutes: number)
 * Requires: user exists
 * Effects: adds minutes to user's current screen time
 */
export function updateScreenTime(userId: string, minutes: number): void {
  const user = users.get(userId);
  if (!user) {
    throw new Error(`User ${userId} does not exist.`);
  }
  user.screenTime += minutes;
}

/**
 * shareScreenTime(userId: string, peerId: string)
 * Requires: both users exist
 * Effects: adds peerId to sharedPeers of userId
 */
export function shareScreenTime(userId: string, peerId: string): void {
  const user = users.get(userId);
  const peer = users.get(peerId);
  if (!user || !peer) {
    throw new Error(`User or peer does not exist.`);
  }
  user.sharedPeers.add(peerId);
}

// ----- Queries -----

/**
 * listPeerTimes(userId: string)
 * Returns: Array of { peerId, time } for each peer in sharedPeers
 */
export function listPeerTimes(
  userId: string,
): { peerId: string; time: number }[] {
  const user = users.get(userId);
  if (!user) {
    throw new Error(`User ${userId} does not exist.`);
  }
  const peers = Array.from(user.sharedPeers);
  return peers.map((peerId) => {
    const peer = users.get(peerId);
    return {
      peerId,
      time: peer ? peer.screenTime : 0,
    };
  });
}

// ----- Demo / Local Test -----
if (import.meta.main) {
  console.log("=== Accountability Demo ===");
  addUser("alice");
  addUser("bob");
  addUser("charlie");

  updateScreenTime("alice", 120);
  updateScreenTime("bob", 100);
  updateScreenTime("charlie", 250);

  shareScreenTime("alice", "bob");
  shareScreenTime("alice", "charlie");

  console.log("Peer screen times for Alice:", listPeerTimes("alice"));
}
