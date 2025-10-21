// src/concepts/Tests/friendGroup_test.ts

import {
  addMember,
  createGroup,
  Groups,
  listGroups,
  removeMember,
  setConfirmationPolicy,
} from "../friendGroup.ts";

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
 * Typical flow: create group, add members, list groups
 */
Deno.test("Operational Principle: Basic FriendGroup Flow", () => {
  logSection("Operational Principle Test");

  console.log("Creating group 'Study Buddies'...");
  const groupId = createGroup("Study Buddies", true);

  console.log("Adding members Alice and Bob...");
  addMember(groupId, "Alice");
  addMember(groupId, "Bob");

  console.log("Listing groups for Alice...");
  const aliceGroups = listGroups("Alice");
  console.log("Alice belongs to groups:", aliceGroups);

  if (!aliceGroups.includes(groupId)) {
    throw new Error("Alice should be in the group");
  }

  console.log("Checking members of the group...");
  const group = Groups.get(groupId);
  if (!group || !group.members.has("Bob")) {
    throw new Error("Bob should be in the group");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to add the same member twice
 */
Deno.test("Interesting Scenario 1: Adding Duplicate Member", () => {
  logSection("Interesting Scenario 1: Duplicate Member");

  const groupId = createGroup("Work Buddies", false);
  addMember(groupId, "Carol");

  console.log("Adding Carol again...");
  addMember(groupId, "Carol"); // Should silently succeed, Set prevents duplicates

  const group = Groups.get(groupId);
  if (!group || group.members.size !== 1) {
    throw new Error("Carol should only appear once in the group");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Removing a member who is not part of the group
 */
Deno.test("Error Case: Removing Non-Member", () => {
  logSection("Interesting Scenario 2: Removing Non-Member");

  const groupId = createGroup("Gym Buddies", true);
  addMember(groupId, "Dana");

  let errorCaught = false;
  try {
    removeMember(groupId, "Eve");
  } catch (e) {
    console.log(`Caught expected error: ${(e as Error).message}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown when removing non-member");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Change confirmation policy
 */
Deno.test("Interesting Scenario 3: Updating Confirmation Policy", () => {
  logSection("Interesting Scenario 3: Update Confirmation Policy");

  const groupId = createGroup("Reading Club", true);
  console.log(
    "Initial requiresConfirmation:",
    Groups.get(groupId)?.requiresConfirmation,
  );

  console.log("Setting requiresConfirmation to false...");
  setConfirmationPolicy(groupId, false);

  if (Groups.get(groupId)?.requiresConfirmation !== false) {
    throw new Error("Confirmation policy was not updated");
  }
});

/**
 * INTERESTING SCENARIO 4:
 * List groups for user in multiple groups
 */
Deno.test("Interesting Scenario 4: Multi-Group Membership", () => {
  logSection("Interesting Scenario 4: Multi-Group Membership");

  const groupA = createGroup("Chess Club", true);
  const groupB = createGroup("Book Club", false);

  addMember(groupA, "Frank");
  addMember(groupB, "Frank");

  const frankGroups = listGroups("Frank");
  console.log("Frank belongs to groups:", frankGroups);

  if (!frankGroups.includes(groupA) || !frankGroups.includes(groupB)) {
    throw new Error("Frank should belong to both groups");
  }
});
