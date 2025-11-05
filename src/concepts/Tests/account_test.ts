import {
  addUser,
  deleteUser,
  getUser,
  loginUser,
  Users,
} from "../Account/account.ts";

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
 * 3. Login with correct password
 * 4. Delete the user
 */
Deno.test("Operational Principle: Basic User Flow with Login", () => {
  logSection("Operational Principle Test");

  console.log("Adding user Alice...");
  addUser("Alice", "Alice Smith", "alice@example.com", "password123");

  console.log("Retrieving Alice's info...");
  const alice = getUser("Alice");
  console.log("Alice info:", alice);

  if (
    !alice || alice.name !== "Alice Smith" ||
    alice.email !== "alice@example.com"
  ) {
    throw new Error("User retrieval failed or incorrect");
  }

  console.log("Logging in Alice with correct password...");
  const loginRes = loginUser("Alice", "password123");
  console.log("Login result:", loginRes);

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

  addUser("Bob", "Bob Jones", "bob@example.com", "pass123");

  let errorCaught = false;
  try {
    addUser("Bob", "Bob Jones", "bob@example.com", "pass123");
  } catch (e) {
    console.log(`Caught expected error: ${e instanceof Error ? e.message : e}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for duplicate user");
  }

  deleteUser("Bob");
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
 * Adding multiple users and verifying isolation + login
 */
Deno.test("Interesting Scenario 4: Multiple Users Isolation with Login", () => {
  logSection("Interesting Scenario 4: Multi-user Isolation");

  addUser("Eve", "Eve Adams", "eve@example.com", "evepass");
  addUser("Frank", "Frank Black", "frank@example.com", "frankpass");

  const eve = getUser("Eve");
  const frank = getUser("Frank");

  if (eve.name !== "Eve Adams" || frank.name !== "Frank Black") {
    throw new Error("User info mismatch for multiple users");
  }

  // Test login
  loginUser("Eve", "evepass");
  loginUser("Frank", "frankpass");

  deleteUser("Eve");
  deleteUser("Frank");
});

/**
 * INTERESTING SCENARIO 5:
 * Attempt login with wrong password
 */
Deno.test("Error Case: Login with wrong password", () => {
  logSection("Interesting Scenario 5: Wrong Password Login");

  addUser("Grace", "Grace Hopper", "grace@example.com", "correctpass");

  let errorCaught = false;
  try {
    loginUser("Grace", "wrongpass");
  } catch (e) {
    console.log(`Caught expected error: ${e instanceof Error ? e.message : e}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for wrong password login");
  }

  deleteUser("Grace");
});
