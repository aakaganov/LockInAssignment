import {
  addUser,
  listPeerTimes,
  shareScreenTime,
  updateScreenTime,
} from "../accountability.ts";

/**
 * Helper to print section headers cleanly in test output
 */
function logSection(title: string) {
  console.log(`\n==============================`);
  console.log(title.toUpperCase());
  console.log(`==============================`);
}

/**
 * OPERATIONAL PRINCIPLE TEST
 * ------------------------------------------------
 * Typical usage:
 * 1. Add users
 * 2. Update screen times
 * 3. Share screen times with peers
 * 4. List peer times
 */
Deno.test("Operational Principle: Basic Accountability Flow", () => {
  logSection("Operational Principle Test");

  console.log("Creating users Alice, Bob, Charlie...");
  addUser("Alice");
  addUser("Bob");
  addUser("Charlie");

  console.log("Updating screen times: Alice 120, Bob 100, Charlie 250...");
  updateScreenTime("Alice", 120);
  updateScreenTime("Bob", 100);
  updateScreenTime("Charlie", 250);

  console.log("Sharing screen times: Alice -> Bob & Charlie...");
  shareScreenTime("Alice", "Bob");
  shareScreenTime("Alice", "Charlie");

  console.log("Listing peer times for Alice...");
  const peerTimes = listPeerTimes("Alice");
  console.log("Peer times:", peerTimes);

  if (peerTimes.length !== 2) {
    throw new Error("Expected 2 peers listed for Alice.");
  }
  if (!peerTimes.some((p) => p.peerId === "Bob" && p.time === 100)) {
    throw new Error("Bob's screen time incorrect.");
  }
  if (!peerTimes.some((p) => p.peerId === "Charlie" && p.time === 250)) {
    throw new Error("Charlie's screen time incorrect.");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to add a user that already exists
 */
Deno.test("Error Case: Duplicate User Creation", () => {
  logSection("Interesting Scenario 1: Duplicate User Creation");

  addUser("Dave");

  let errorCaught = false;
  try {
    addUser("Dave");
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for duplicate user.");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Update screen time for non-existent user
 */
Deno.test("Error Case: Update Screen Time for Non-existent User", () => {
  logSection("Interesting Scenario 2: Update Non-existent User");

  let errorCaught = false;
  try {
    updateScreenTime("NonExistent", 50);
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-existent user.");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Share screen time with a non-existent peer
 */
Deno.test("Error Case: Share Screen Time with Non-existent Peer", () => {
  logSection("Interesting Scenario 3: Share With Non-existent Peer");

  addUser("Eve");

  let errorCaught = false;
  try {
    shareScreenTime("Eve", "GhostPeer");
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-existent peer.");
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Verify peer isolation
 */
Deno.test("Interesting Scenario 4: Peer Isolation", () => {
  logSection("Interesting Scenario 4: Peer Isolation");

  addUser("Frank");
  addUser("Grace");

  updateScreenTime("Frank", 80);
  updateScreenTime("Grace", 200);

  shareScreenTime("Frank", "Grace");

  const frankPeers = listPeerTimes("Frank");
  const gracePeers = listPeerTimes("Grace");

  if (frankPeers.length !== 1 || frankPeers[0].peerId !== "Grace") {
    throw new Error("Frank's peers incorrect.");
  }

  if (gracePeers.length !== 0) {
    throw new Error("Grace should have no peers.");
  }
});
