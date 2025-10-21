import {
  confirmTask,
  finalizeConfirmation,
  getConfirmations,
  requestConfirmation,
} from "../confirmTask.ts";

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
 * 1. Request confirmation for a completed task
 * 2. Peer confirms task
 * 3. Finalize confirmation
 * 4. Retrieve confirmations for user
 */
Deno.test("Operational Principle: Confirm Task Flow", () => {
  logSection("Operational Principle Test");

  console.log("Requesting confirmation for task t1...");
  requestConfirmation("t1", "Alice");

  console.log("Peer Bob confirms task t1...");
  confirmTask("t1", "Bob");

  console.log("Finalizing confirmation for task t1...");
  finalizeConfirmation("t1");

  console.log("Getting confirmations for Alice...");
  const confirmations = getConfirmations("Alice");
  if (confirmations.length !== 1) {
    throw new Error("Expected 1 confirmation for Alice");
  }

  const conf = confirmations[0];
  if (conf.status !== "verified") {
    throw new Error("Expected confirmation to be verified");
  }
  if (!conf.confirmedBy.has("Bob")) {
    throw new Error("Expected Bob to be in confirmedBy");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Requesting confirmation twice for the same task
 */
Deno.test("Error Case: Duplicate confirmation request", () => {
  logSection("Interesting Scenario 1: Duplicate Request");

  let errorCaught = false;
  try {
    requestConfirmation("t2", "Alice");
    requestConfirmation("t2", "Alice"); // Should throw
  } catch (e) {
    console.log(`Caught expected error: ${(e as Error).message}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error(
      "Expected error not thrown for duplicate confirmation request",
    );
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Finalize confirmation with no peers confirming
 */
Deno.test("Error Case: Finalize without peer confirmation", () => {
  logSection("Interesting Scenario 2: Finalize without confirmations");

  requestConfirmation("t3", "Alice");

  let errorCaught = false;
  try {
    finalizeConfirmation("t3");
  } catch (e) {
    console.log(`Caught expected error: ${(e as Error).message}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error(
      "Expected error not thrown for finalize with no confirmations",
    );
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Confirming a non-existent task
 */
Deno.test("Error Case: Confirm non-existent task", () => {
  logSection("Interesting Scenario 3: Confirm non-existent task");

  let errorCaught = false;
  try {
    confirmTask("nonexistent", "Bob");
  } catch (e) {
    console.log(`Caught expected error: ${(e as Error).message}`);
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error(
      "Expected error not thrown for confirming non-existent task",
    );
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Multiple peers confirming the same task
 */
Deno.test("Interesting Scenario 4: Multiple peers confirm", () => {
  logSection("Interesting Scenario 4: Multiple peer confirmations");

  requestConfirmation("t4", "Alice");

  console.log("Peers Bob and Carol confirm task t4...");
  confirmTask("t4", "Bob");
  confirmTask("t4", "Carol");

  finalizeConfirmation("t4");

  const conf = getConfirmations("Alice").find((c) => c.taskId === "t4");
  if (!conf) throw new Error("Task t4 confirmation missing");
  if (conf.confirmedBy.size !== 2) {
    throw new Error("Expected 2 peers to have confirmed");
  }
  if (conf.status !== "verified") {
    throw new Error("Expected task t4 to be verified");
  }
});
