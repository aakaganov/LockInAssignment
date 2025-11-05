import {
  FriendGroups,
  FriendGroupStats,
  getLeaderboardByTasks,
  getLeaderboardByTime,
  recordCompletion,
  resetWeeklyStats,
} from "../Leaderboard/leaderboard.ts";

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
 * 1. Create group
 * 2. Record task completions for users
 * 3. Retrieve leaderboard
 */
Deno.test("Operational Principle: Basic Leaderboard Flow", () => {
  logSection("Operational Principle Test");

  // Setup group
  const groupId = "g1";
  FriendGroups.set(groupId, {
    groupId,
    confirmationRequired: false,
    weekStart: new Date(),
    weeklyStats: new Map(),
  } as FriendGroupStats);

  console.log("Recording task completions...");
  recordCompletion("Alice", 120, groupId); // 2 hours
  recordCompletion("Bob", 60, groupId); // 1 hour
  recordCompletion("Alice", 30, groupId); // +0.5 hour

  console.log("Checking leaderboard by tasks...");
  const tasksLeaderboard = getLeaderboardByTasks(groupId);
  console.log(tasksLeaderboard);

  console.log("Checking leaderboard by hours...");
  const timeLeaderboard = getLeaderboardByTime(groupId);
  console.log(timeLeaderboard);

  if (
    tasksLeaderboard[0].userId !== "Alice" ||
    tasksLeaderboard[0].completedCount !== 2
  ) {
    throw new Error("Tasks leaderboard incorrect");
  }
  if (
    timeLeaderboard[0].userId !== "Alice" ||
    timeLeaderboard[0].completedHours !== 2.5
  ) {
    throw new Error("Time leaderboard incorrect");
  }
});

/**
 * INTERESTING SCENARIO 1:
 * Confirmation required: only confirmed tasks count
 */
Deno.test("Interesting Scenario 1: Confirmation Required", () => {
  logSection("Interesting Scenario 1: Confirmation Required");

  const groupId = "g2";
  FriendGroups.set(groupId, {
    groupId,
    confirmationRequired: true,
    weekStart: new Date(),
    weeklyStats: new Map(),
  } as FriendGroupStats);

  console.log("Recording unconfirmed task...");
  recordCompletion("Carol", 60, groupId, false); // should NOT count

  console.log("Recording confirmed task...");
  recordCompletion("Carol", 90, groupId, true); // should count

  const tasksLeaderboard = getLeaderboardByTasks(groupId);
  const timeLeaderboard = getLeaderboardByTime(groupId);

  console.log(tasksLeaderboard);
  console.log(timeLeaderboard);

  if (
    tasksLeaderboard[0].completedCount !== 1 ||
    timeLeaderboard[0].completedHours !== 1.5
  ) {
    throw new Error("Confirmation logic failed");
  }
});

/**
 * INTERESTING SCENARIO 2:
 * Multiple users in one group
 */
Deno.test("Interesting Scenario 2: Multi-user group leaderboard", () => {
  logSection("Interesting Scenario 2: Multi-user group leaderboard");

  const groupId = "g3";
  FriendGroups.set(groupId, {
    groupId,
    confirmationRequired: false,
    weekStart: new Date(),
    weeklyStats: new Map(),
  } as FriendGroupStats);

  recordCompletion("Dave", 30, groupId);
  recordCompletion("Eve", 120, groupId);
  recordCompletion("Frank", 60, groupId);

  const tasksLeaderboard = getLeaderboardByTasks(groupId);
  const timeLeaderboard = getLeaderboardByTime(groupId);

  console.log(tasksLeaderboard);
  console.log(timeLeaderboard);

  if (tasksLeaderboard[0].userId !== "Eve") {
    throw new Error("Tasks leaderboard incorrect");
  }
  if (timeLeaderboard[0].userId !== "Eve") {
    throw new Error("Time leaderboard incorrect");
  }
});

/**
 * INTERESTING SCENARIO 3:
 * Reset weekly stats
 */
Deno.test("Interesting Scenario 3: Reset weekly stats", () => {
  logSection("Interesting Scenario 3: Reset weekly stats");

  const groupId = "g4";
  FriendGroups.set(groupId, {
    groupId,
    confirmationRequired: false,
    weekStart: new Date(),
    weeklyStats: new Map([
      ["George", {
        userId: "George",
        completedCount: 3,
        completedMinutes: 180,
      }],
    ]),
  } as FriendGroupStats);

  console.log("Resetting weekly stats...");
  resetWeeklyStats();

  const stat = FriendGroups.get(groupId)!.weeklyStats.get("George");
  console.log(stat);

  if (stat!.completedCount !== 0 || stat!.completedMinutes !== 0) {
    throw new Error("Weekly stats were not reset properly");
  }
});
