import {
  addTask,
  addUser,
  getUser,
  markDone,
  unlockApps,
} from "../OgProject/taskGate.ts";

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
 * 1. Add user
 * 2. Add tasks
 * 3. Complete tasks
 * 4. Unlock apps
 */
Deno.test("Operational Principle: Basic TaskGate Flow", () => {
  logSection("Operational Principle Test");

  console.log("Creating user Alice...");
  addUser("Alice");

  console.log("Adding tasks t1 and t2...");
  addTask("Alice", { taskId: "t1", description: "Write report" });
  addTask("Alice", { taskId: "t2", description: "Review emails" });

  console.log("Marking tasks done...");
  markDone("Alice", "t1");
  markDone("Alice", "t2");

  console.log("Unlocking apps...");
  unlockApps("Alice");

  // Programmatic assertions
  const user = getUser("Alice");
  if (!user) throw new Error("User not found after creation.");
  if (user.appsLocked) {
    throw new Error("Apps should be unlocked after completing all tasks.");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to add a task that already exists.
 */
Deno.test("Error Case: Adding duplicate task", () => {
  logSection("Interesting Scenario 1: Duplicate Task");

  addUser("Bob");
  addTask("Bob", { taskId: "t1", description: "Do homework" });

  let errorCaught = false;
  try {
    addTask("Bob", { taskId: "t1", description: "Do homework again" });
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    }
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for duplicate task.");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Try to mark a non-existent task as done.
 */
Deno.test("Error Case: Marking non-existent task done", () => {
  logSection("Interesting Scenario 2: Non-existent Task");

  addUser("Carol");

  let errorCaught = false;
  try {
    markDone("Carol", "t999");
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    }
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-existent task.");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Attempt to unlock apps before completing all tasks.
 */
Deno.test("Error Case: Unlocking apps before all tasks done", () => {
  logSection("Interesting Scenario 3: Unlock Apps Prematurely");

  addUser("Dana");
  addTask("Dana", { taskId: "t1", description: "Clean desk" });
  addTask("Dana", { taskId: "t2", description: "Check email" });

  markDone("Dana", "t1");

  let errorCaught = false;
  try {
    unlockApps("Dana");
  } catch (e) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    }
    errorCaught = true;
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for premature unlock.");
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Multiple users' tasks are independent.
 */
Deno.test("Interesting Scenario 4: Multi-user Task Isolation", () => {
  logSection("Interesting Scenario 4: Multi-user Task Isolation");

  addUser("Eve");
  addUser("Frank");

  addTask("Eve", { taskId: "t1", description: "Task for Eve" });
  addTask("Frank", { taskId: "t2", description: "Task for Frank" });

  markDone("Eve", "t1");
  unlockApps("Eve"); // Eve's apps unlocked

  const eveUser = getUser("Eve");
  const frankUser = getUser("Frank");

  if (!eveUser || eveUser.appsLocked) {
    throw new Error("Eve's apps should be unlocked.");
  }

  if (!frankUser || !frankUser.appsLocked) {
    throw new Error("Frank's apps should still be locked.");
  }
});
