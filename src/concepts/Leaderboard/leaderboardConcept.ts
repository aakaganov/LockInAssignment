import {
  FriendGroups,
  getLeaderboardByTasks,
  getLeaderboardByTime,
  recordCompletion,
  resetWeeklyStats,
} from "../Leaderboard/leaderboard.ts";

/**
 * LeaderboardConcept — wraps leaderboard operations as API endpoints
 * Exposes the same endpoints that your frontend calls:
 *  - /Leaderboard/recordCompletion
 *  - /Leaderboard/getLeaderboardByTasks
 *  - /Leaderboard/getLeaderboardByTime
 *  - /Leaderboard/resetWeeklyStats
 */
export default class LeaderboardConcept {
  constructor(_db: any) {
    // db available if needed later, but not used here
  }

  async recordCompletion(body: {
    userId: string;
    actualTime: number;
    groupId: string;
    confirmed?: boolean;
  }) {
    try {
      recordCompletion(
        body.userId,
        body.actualTime,
        body.groupId,
        body.confirmed ?? true,
      );
      return { success: true };
    } catch (err: any) {
      console.error("Error in recordCompletion:", err);
      return { error: err.message };
    }
  }

  async getLeaderboardByTasks(body: { groupId: string }) {
    try {
      const data = getLeaderboardByTasks(body.groupId);
      return { leaderboard: data };
    } catch (err: any) {
      console.error("Error in getLeaderboardByTasks:", err);
      return { error: err.message };
    }
  }

  async getLeaderboardByTime(body: { groupId: string }) {
    try {
      const data = getLeaderboardByTime(body.groupId);
      return { leaderboard: data };
    } catch (err: any) {
      console.error("Error in getLeaderboardByTime:", err);
      return { error: err.message };
    }
  }

  async resetWeeklyStats(_body: {}) {
    try {
      resetWeeklyStats();
      return { success: true };
    } catch (err: any) {
      console.error("Error in resetWeeklyStats:", err);
      return { error: err.message };
    }
  }
}
