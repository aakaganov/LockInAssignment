import { Db } from "npm:mongodb";

export interface WeeklyStat {
  userId: string;
  completedCount: number;
  completedMinutes: number;
}

export interface FriendGroupStats {
  groupId: string;
  confirmationRequired: boolean;
  weekStart: Date;
  weeklyStats: WeeklyStat[];
}
export async function ensureGroupLeaderboardArrays(db: Db, groupId: string) {
  const group = await db.collection("groups").findOne({ groupId });
  if (!group) return false;

  const set: any = {};
  if (!Array.isArray(group.rankedByTask)) set.rankedByTask = [];
  if (!Array.isArray(group.rankedByTime)) set.rankedByTime = [];

  if (Object.keys(set).length > 0) {
    await db.collection("groups").updateOne({ groupId }, { $set: set });
  }

  return true;
}

/**
 * Recalculate leaderboard rankings for every group that contains this user.
 * Called whenever a task is completed or confirmed.
 */
export async function updateLeaderboardsForUser(db: Db, userId: string) {
  // 1. Find all groups containing the user
  const groups = await db.collection("groups")
    .find({ members: userId })
    .toArray();

  if (!groups.length) return;

  // 2. Load the user's updated stats
  const user = await db.collection("users").findOne({ userId });
  if (!user) return;

  for (const group of groups) {
    const memberIds = group.members ?? [];

    // 3. Load stats for ALL members
    const users = await db.collection("users")
      .find({ userId: { $in: memberIds } })
      .toArray();

    // Create lookup table
    const stats = users.map((u) => ({
      userId: u.userId,
      tasks: group.confirmationRequired
        ? u.confirmedTasksCompleted ?? 0
        : u.tasksCompleted ?? 0,
      minutes: group.confirmationRequired
        ? u.confirmedMinutesCompleted ?? 0
        : u.minutesCompleted ?? 0,
    }));

    // 4. Build rankings
    const rankedByTask = stats
      .slice()
      .sort((a, b) => b.tasks - a.tasks)
      .map((s) => ({
        userId: s.userId,
        completedCount: s.tasks,
      }));

    const rankedByTime = stats
      .slice()
      .sort((a, b) => b.minutes - a.minutes)
      .map((s) => ({
        userId: s.userId,
        completedMinutes: s.minutes,
      }));

    // 5. Write back into the group document
    await db.collection("groups").updateOne(
      { groupId: group.groupId },
      {
        $set: {
          rankedByTask,
          rankedByTime,
        },
      },
    );
  }
}

export async function getGroupStats(
  db: Db,
  groupId: string,
): Promise<FriendGroupStats | null> {
  const group = await db.collection("groups").findOne({ groupId });
  if (!group) return null;

  // Normalize weekly stats
  const weeklyStats: WeeklyStat[] = (group.rankedByTask || []).map((
    user: any,
  ) => ({
    userId: user.userId,
    completedCount: user.completedCount ?? 0,
    completedMinutes:
      (group.rankedByTime?.find((u: any) => u.userId === user.userId)
        ?.completedMinutes) ?? 0,
  }));

  return {
    groupId: group.groupId,
    confirmationRequired: group.confirmationRequired ?? false,
    weekStart: group.weekStart ?? new Date(),
    weeklyStats,
  };
}

/**
 * Record a task completion for a user in a group
 */
export async function recordCompletion(
  db: Db,
  userId: string,
  actualTime: number,
  groupId: string,
  confirmed: boolean = true,
) {
  const exists = await ensureGroupLeaderboardArrays(db, groupId);
  if (!exists) {
    console.warn(
      `⚠️ Cannot record completion: Group ${groupId} does not exist in DB`,
    );
    return;
  }
  if (actualTime <= 0) throw new Error("actualTime must be > 0");

  const group = await db.collection("groups").findOne({ groupId });
  if (!group) {
    console.warn(
      `⚠️ Cannot record completion: Group ${groupId} does not exist`,
    );
    return;
  }

  if (group.confirmationRequired && !confirmed) return;

  // Increment existing stats if user exists
  const updatedTask = await db.collection("groups").updateOne(
    { groupId, "rankedByTask.userId": userId },
    { $inc: { "rankedByTask.$.completedCount": 1 } },
  );

  const updatedTime = await db.collection("groups").updateOne(
    { groupId, "rankedByTime.userId": userId },
    { $inc: { "rankedByTime.$.completedMinutes": actualTime } },
  );

  // If user not present, push new entries separately
  if (updatedTask.matchedCount === 0) {
    await db.collection("groups").updateOne(
      { groupId },
      { $push: { rankedByTask: { userId, completedCount: 1 } as any } },
    );
  }

  if (updatedTime.matchedCount === 0) {
    await db.collection("groups").updateOne(
      { groupId },
      {
        $push: {
          rankedByTime: { userId, completedMinutes: actualTime } as any,
        },
      },
    );
  }
}

/**
 * Get leaderboard sorted by completed tasks
 */
export async function getLeaderboardByTasks(db: Db, groupId: string) {
  const groups = await db.collection("groups").find().toArray();
  console.log("Existing groups:", groups.map((g) => g.groupId));
  const group = await getGroupStats(db, groupId);
  if (!group) {
    console.warn(`⚠️ Leaderboard requested for non-existent group ${groupId}`);
    return [];
  }

  return group.weeklyStats
    .slice()
    .sort((a, b) =>
      b.completedCount - a.completedCount ||
      b.completedMinutes - a.completedMinutes
    )
    .map((stat) => ({
      userId: stat.userId,
      completedCount: stat.completedCount,
    }));
}

/**
 * Get leaderboard sorted by time
 */
export async function getLeaderboardByTime(db: Db, groupId: string) {
  const group = await getGroupStats(db, groupId);
  if (!group) {
    console.warn(`⚠️ Leaderboard requested for non-existent group ${groupId}`);
    return [];
  }

  return group.weeklyStats
    .slice()
    .sort((a, b) => b.completedMinutes - a.completedMinutes)
    .map((stat) => ({
      userId: stat.userId,
      completedMinutes: stat.completedMinutes,
    }));
}

/**
 * Reset weekly stats for all groups
 */
export async function resetWeeklyStats(
  db: Db,
  newWeekStart: Date = new Date(),
) {
  const groups = await db.collection("groups").find().toArray();

  for (const group of groups) {
    const resetTasks = group.rankedByTask.map((u: any) => ({
      ...u,
      completedCount: 0,
    }));
    const resetTime = group.rankedByTime.map((u: any) => ({
      ...u,
      completedMinutes: 0,
    }));

    await db.collection("groups").updateOne(
      { groupId: group.groupId },
      {
        $set: {
          rankedByTask: resetTasks,
          rankedByTime: resetTime,
          weekStart: newWeekStart,
        },
      },
    );
  }
}
