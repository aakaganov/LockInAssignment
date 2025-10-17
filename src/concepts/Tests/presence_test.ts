import {
  addPeer,
  addUser,
  getUser,
  heartbeat,
  markInactive,
} from "../presence.ts";

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
 * 2. Add peers
 * 3. Send heartbeat
 * 4. Mark user inactive after threshold
 * 5. Notify peers
 */
Deno.test("Operational Principle: Basic Presence Flow", async () => {
  logSection("Operational Principle Test");

  console.log("Adding users Alice and Bob...");
  addUser("Alice");
  addUser("Bob");

  console.log("Adding Bob as peer to Alice...");
  addPeer("Alice", "Bob");

  console.log("Sending heartbeat for Alice...");
  heartbeat("Alice");

  console.log("Waiting 100ms to simulate inactivity...");
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("Marking Alice inactive with threshold 50ms...");
  markInactive("Alice", 50);

  const alice = getUser("Alice");
  if (!alice || alice.active !== false) {
    throw new Error("Alice should be inactive after threshold.");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to add a user that already exists
 */
Deno.test("Error Case: Duplicate User Creation", () => {
  logSection("Interesting Scenario 1: Duplicate User Creation");

  addUser("Carol");

  let errorCaught = false;
  try {
    addUser("Carol");
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
 * Mark inactive before threshold
 */
Deno.test("Error Case: Mark Inactive Too Soon", () => {
  logSection("Interesting Scenario 2: Mark Inactive Too Soon");

  addUser("Dave");
  heartbeat("Dave");

  let errorCaught = false;
  try {
    markInactive("Dave", 1000); // threshold 1 second
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    }
  }
  if (!errorCaught) {
    throw new Error("Expected error not thrown for too-early inactivity.");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Add peer who does not exist
 */
Deno.test("Error Case: Add Non-existent Peer", () => {
  logSection("Interesting Scenario 3: Add Non-existent Peer");

  addUser("Eve");

  let errorCaught = false;
  try {
    addPeer("Eve", "GhostUser");
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
 * Peer isolation: adding peers only affects correct user
 */
Deno.test("Interesting Scenario 4: Peer Isolation", () => {
  logSection("Interesting Scenario 4: Peer Isolation");

  addUser("Frank");
  addUser("Grace");

  addPeer("Frank", "Grace");

  const frank = getUser("Frank");
  const grace = getUser("Grace");

  if (!frank?.peerGroup.has("Grace")) {
    throw new Error("Frank should have Grace as peer.");
  }

  if (grace?.peerGroup.size !== 0) {
    throw new Error("Grace should have no peers.");
  }
});
