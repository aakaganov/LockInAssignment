import {
  completeTask,
  createTask,
  deleteTask,
  editTask,
  listTasks,
  Tasks,
} from "../Task/task.ts";

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
 * 1. Create task
 * 2. Edit task
 * 3. Complete task
 * 4. List tasks
 * 5. Delete task
 */
Deno.test("Operational Principle: Basic Task Flow", () => {
  logSection("Operational Principle Test");

  console.log("Creating task t1...");
  const taskId = createTask(
    "user1",
    "Write report",
    "Finish by Monday",
    undefined,
    60,
  );

  console.log("Editing task t1...");
  editTask(taskId, "Write full report", undefined, undefined, 90);

  console.log("Completing task t1...");
  completeTask(taskId, 95);

  console.log("Listing tasks for user1...");
  const tasks = listTasks("user1");
  console.log(tasks);

  console.log("Deleting task t1...");
  deleteTask(taskId);

  if (Tasks.has(taskId)) throw new Error("Task t1 should have been deleted");
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to complete a non-existent task
 */
Deno.test("Error Case: Completing non-existent task", () => {
  logSection("Interesting Scenario 1: Non-existent Task");

  let errorCaught = false;
  try {
    completeTask("fakeId", 50);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    } else {
      throw new Error("Caught unknown error type");
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-existent task.");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Attempt to complete an already completed task
 */
Deno.test("Error Case: Completing already completed task", () => {
  logSection("Interesting Scenario 2: Already Completed Task");

  const id = createTask("user2", "Task 2", undefined, undefined, 30);
  completeTask(id, 25);

  let errorCaught = false;
  try {
    completeTask(id, 20);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    } else {
      throw new Error("Caught unknown error type");
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for already completed task.");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Attempt to create a task with invalid estimated time
 */
Deno.test("Error Case: Invalid estimatedTime", () => {
  logSection("Interesting Scenario 3: Invalid Estimated Time");

  let errorCaught = false;
  try {
    createTask("user3", "Task 3", undefined, undefined, 0);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    } else {
      throw new Error("Caught unknown error type");
    }
  }

  if (!errorCaught) {
    throw new Error("Expected error not thrown for invalid estimatedTime.");
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Edit task with invalid estimatedTime
 */
Deno.test("Error Case: Editing with invalid estimatedTime", () => {
  logSection("Interesting Scenario 4: Invalid Edit Estimated Time");

  const id = createTask("user4", "Task 4", undefined, undefined, 45);

  let errorCaught = false;
  try {
    editTask(id, undefined, undefined, undefined, 0);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
      errorCaught = true;
    } else {
      throw new Error("Caught unknown error type");
    }
  }

  if (!errorCaught) {
    throw new Error(
      "Expected error not thrown for invalid edit estimatedTime.",
    );
  }
});
