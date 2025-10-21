export interface WeeklyStat {
  userId: string;
  completedCount: number;
  completedMinutes: number;
}

export interface FriendGroupStats {
  groupId: string;
  confirmationRequired: boolean;
  weekStart: Date;
  weeklyStats: Map<string, WeeklyStat>; // key = userId
}

// In-memory store of all friend groups
export const FriendGroups = new Map<string, FriendGroupStats>();

/**
 * Record a task completion for a user in a specific group
 */
export function recordCompletion(
  userId: string,
  actualTime: number,
  groupId: string,
  confirmed: boolean = true, // whether task was confirmed
) {
  const group = FriendGroups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);
  if (!group.weeklyStats.has(userId)) {
    // initialize stats for new user
    group.weeklyStats.set(userId, {
      userId,
      completedCount: 0,
      completedMinutes: 0,
    });
  }

  if (actualTime <= 0) throw new Error("actualTime must be > 0");

  // Only record if confirmation is not required or task is confirmed
  if (!group.confirmationRequired || confirmed) {
    const stats = group.weeklyStats.get(userId)!;
    stats.completedCount += 1;
    stats.completedMinutes += actualTime;
    group.weeklyStats.set(userId, stats);
  }
}

/**
 * Get leaderboard ranking by number of completed tasks
 */
export function getLeaderboardByTasks(
  groupId: string,
): { userId: string; completedCount: number }[] {
  const group = FriendGroups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);

  return Array.from(group.weeklyStats.values())
    .sort((a, b) => {
      // Primary sort: completedCount descending
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      // Secondary sort: completedMinutes descending
      return b.completedMinutes - a.completedMinutes;
    })
    .map((stat) => ({
      userId: stat.userId,
      completedCount: stat.completedCount,
    }));
}

/**
 * Get leaderboard ranking by completed hours
 */
export function getLeaderboardByTime(
  groupId: string,
): { userId: string; completedHours: number }[] {
  const group = FriendGroups.get(groupId);
  if (!group) throw new Error(`Group ${groupId} does not exist`);

  return Array.from(group.weeklyStats.values())
    .sort((a, b) => b.completedMinutes - a.completedMinutes)
    .map((stat) => ({
      userId: stat.userId,
      completedHours: stat.completedMinutes / 60,
    }));
}

/**
 * Reset weekly stats for all groups
 */
export function resetWeeklyStats(newWeekStart: Date = new Date()) {
  FriendGroups.forEach((group) => {
    group.weeklyStats.forEach((stat) => {
      stat.completedCount = 0;
      stat.completedMinutes = 0;
    });
    group.weekStart = newWeekStart;
  });
}
