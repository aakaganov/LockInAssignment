import { addUser, deleteUser, getUser, Users } from "../account.ts";

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
 * Expected typical usage:
 * 1. Add a user
 * 2. Retrieve the user
 * 3. Delete the user
 */
Deno.test("Operational Principle: Basic User Flow", () => {
  logSection("Operational Principle Test");

  console.log("Adding user Alice...");
  addUser("Alice", "Alice Smith", "alice@example.com");

  console.log("Retrieving Alice's info...");
  const alice = getUser("Alice");
  console.log("Alice info:", alice);

  if (
    !alice || alice.name !== "Alice Smith" ||
    alice.email !== "alice@example.com"
  ) {
    throw new Error("User retrieval failed or incorrect");
  }

  console.log("Deleting Alice...");
  deleteUser("Alice");

  if (Users.has("Alice")) {
    throw new Error("User deletion failed");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to add a user that already exists.
 */
Deno.test("Error Case: Adding duplicate user", () => {
  logSection("Interesting Scenario 1: Duplicate User");

  addUser("Bob", "Bob Jones", "bob@example.com");

  let errorCaught = false;
  try {
    addUser("Bob", "Bob Jones", "bob@example.com");
  } catch (e) {
    console.log(`Caught expected error: ${e instanceof Error ? e.message : e}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for duplicate user");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Attempt to retrieve a non-existent user.
 */
Deno.test("Error Case: Retrieving non-existent user", () => {
  logSection("Interesting Scenario 2: Non-existent User");

  let errorCaught = false;
  try {
    getUser("Charlie");
  } catch (e) {
    console.log(`Caught expected error: ${e instanceof Error ? e.message : e}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-existent user");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Attempt to delete a non-existent user.
 */
Deno.test("Error Case: Deleting non-existent user", () => {
  logSection("Interesting Scenario 3: Delete Non-existent User");

  let errorCaught = false;
  try {
    deleteUser("Dana");
  } catch (e) {
    console.log(`Caught expected error: ${e instanceof Error ? e.message : e}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for deleting non-existent user");
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Adding multiple users and verifying isolation
 */
Deno.test("Interesting Scenario 4: Multiple Users Isolation", () => {
  logSection("Interesting Scenario 4: Multi-user Isolation");

  addUser("Eve", "Eve Adams", "eve@example.com");
  addUser("Frank", "Frank Black", "frank@example.com");

  const eve = getUser("Eve");
  const frank = getUser("Frank");

  if (eve.name !== "Eve Adams" || frank.name !== "Frank Black") {
    throw new Error("User info mismatch for multiple users");
  }

  deleteUser("Eve");
  deleteUser("Frank");
});
