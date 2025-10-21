import { Scroll } from "../OgProject/scrollBlocker.ts";

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
 * 2. Download apps
 * 3. Manually block some apps
 * 4. Apply AI suggestions
 * 5. Remove a block
 */
Deno.test("Operational Principle: Basic Scroll Blocking Flow", () => {
  logSection("Operational Principle Test");

  const scroll = new Scroll();
  console.log("Creating user Alice...");
  scroll.addUser("Alice");

  console.log("Downloading apps: Instagram (scrolling), Slack (non-scrolling)");
  scroll.downloadApp("Instagram", true);
  scroll.downloadApp("Slack", false);

  console.log("Setting manual scroll block for Instagram (8:00–10:00)");
  scroll.setBlockManual(
    "Alice",
    { start: "08:00", end: "10:00" },
    "Instagram",
    true,
  );

  console.log("Applying mock AISetBlock suggestions...");
  scroll.AISetBlock("Alice");

  console.log("Removing manual block for Instagram (8:00–10:00)");
  scroll.removeBlock("Alice", { start: "08:00", end: "10:00" }, "Instagram");

  // Programmatic assertions:
  const userState = scroll.users.get("Alice");
  if (!userState) throw new Error("User not found after creation.");
  if (userState.blockedPeriods.size === 0) {
    throw new Error("Expected blocked periods after AI suggestions.");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Attempt to re-download an app that already exists.
 */
Deno.test("Error Case: Re-downloading the same app", () => {
  logSection("Interesting Scenario 1: Duplicate App Download");

  const scroll = new Scroll();
  scroll.addUser("Bob");
  scroll.downloadApp("Twitter", true);

  let errorCaught = false;
  try {
    scroll.downloadApp("Twitter", true);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    } else {
      console.log("Caught unknown error:", e);
    }
    errorCaught = true;
  }
  if (!errorCaught) {
    throw new Error("Expected error not thrown for duplicate app.");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Try to set a scroll block on a non-scrolling app (should fail).
 */
Deno.test("Error Case: Scrolling block on non-scrolling app", () => {
  logSection("Interesting Scenario 2: Invalid Scrolling Block");

  const scroll = new Scroll();
  scroll.addUser("Carol");
  scroll.downloadApp("Notes", false);

  let errorCaught = false;
  try {
    scroll.setBlockManual(
      "Carol",
      { start: "10:00", end: "12:00" },
      "Notes",
      true,
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    } else {
      console.log("Caught unknown error:", e);
    }
    errorCaught = true;
  }
  if (!errorCaught) {
    throw new Error("Expected error not thrown for non-scrolling block.");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Remove a block that doesn't exist.
 */
Deno.test("Error Case: Removing non-existent block", () => {
  logSection("Interesting Scenario 3: Non-existent Block Removal");

  const scroll = new Scroll();
  scroll.addUser("Dana");
  scroll.downloadApp("TikTok", true);

  let errorCaught = false;
  try {
    scroll.removeBlock("Dana", { start: "07:00", end: "09:00" }, "TikTok");
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`Caught expected error: ${e.message}`);
    } else {
      console.log("Caught unknown error:", e);
    }
    errorCaught = true;
  }
  if (!errorCaught) {
    throw new Error(
      "Expected error not thrown for removing non-existent block.",
    );
  }
});

/**
 * INTERESTING SCENARIO 4:
 * Add multiple users and verify isolation of state.
 */
Deno.test("Interesting Scenario 4: Multi-user State Isolation", () => {
  logSection("Interesting Scenario 4: Multi-user State Isolation");

  const scroll = new Scroll();
  scroll.addUser("Eve");
  scroll.addUser("Frank");
  scroll.downloadApp("Reddit", true);

  scroll.setBlockManual(
    "Eve",
    { start: "18:00", end: "19:00" },
    "Reddit",
    true,
  );
  const eveState = scroll.users.get("Eve");
  const frankState = scroll.users.get("Frank");

  if (!eveState || eveState.blockedPeriods.size === 0) {
    throw new Error("Eve's block not recorded.");
  }
  if (frankState?.blockedPeriods.size) {
    throw new Error("Frank should not have any blocked periods.");
  }
});
