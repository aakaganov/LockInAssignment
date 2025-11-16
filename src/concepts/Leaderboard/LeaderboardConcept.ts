import { Db } from "npm:mongodb";

export default class LeaderboardConcept {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  // Record a task completion in DB
  async recordCompletion(body: {
    userId: string;
    actualTime: number;
    groupId: string;
    confirmed?: boolean;
  }) {
    try {
      const { userId, actualTime, groupId, confirmed = true } = body;

      if (actualTime <= 0) throw new Error("actualTime must be > 0");

      const group = await this.db.collection("groups").findOne({ groupId });
      if (!group) throw new Error(`Group ${groupId} does not exist`);

      // Only record if confirmation is not required or task is confirmed
      if (!group.confirmationRequired || confirmed) {
        // Increment existing stats or push new entries
        const taskUpdate = await this.db.collection("groups").updateOne(
          { groupId, "rankedByTask.userId": userId },
          { $inc: { "rankedByTask.$.completedCount": 1 } },
        );

        if (taskUpdate.matchedCount === 0) {
          await this.db.collection("groups").updateOne(
            { groupId },
            { $push: { rankedByTask: { userId, completedCount: 1 } as any } },
          );
        }

        const timeUpdate = await this.db.collection("groups").updateOne(
          { groupId, "rankedByTime.userId": userId },
          { $inc: { "rankedByTime.$.completedMinutes": actualTime } },
        );

        if (timeUpdate.matchedCount === 0) {
          await this.db.collection("groups").updateOne(
            { groupId },
            {
              $push: {
                rankedByTime: { userId, completedMinutes: actualTime } as any,
              },
            },
          );
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error in recordCompletion:", err);
      return { error: err.message };
    }
  }

  // Fetch leaderboard by tasks
  async getLeaderboardByTasks(body: { groupId: string }) {
    try {
      const group = await this.db.collection("groups").findOne({
        groupId: body.groupId,
      });
      if (!group) return { leaderboard: [] };
      return { leaderboard: group.rankedByTask || [] };
    } catch (err: any) {
      console.error("Error in getLeaderboardByTasks:", err);
      return { error: err.message };
    }
  }

  // Fetch leaderboard by time
  async getLeaderboardByTime(body: { groupId: string }) {
    try {
      const group = await this.db.collection("groups").findOne({
        groupId: body.groupId,
      });
      if (!group) return { leaderboard: [] };
      return { leaderboard: group.rankedByTime || [] };
    } catch (err: any) {
      console.error("Error in getLeaderboardByTime:", err);
      return { error: err.message };
    }
  }

  // Reset weekly stats for all groups
  async resetWeeklyStats(_body: {}) {
    try {
      await this.db.collection("groups").updateMany(
        {},
        {
          $set: {
            "rankedByTask": [],
            "rankedByTime": [],
          },
        },
      );
      return { success: true };
    } catch (err: any) {
      console.error("Error in resetWeeklyStats:", err);
      return { error: err.message };
    }
  }
}
