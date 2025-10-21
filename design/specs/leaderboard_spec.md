Purpose: Provide friendly competition based on productivity.
Principle: Rewarding actual effort motivates consistent progress.


State:
FriendGroups (set of all groups)
  groupId: String
  confirmationRequired: Boolean (for tasks in that group)
  weekStart: Date
  weeklyStats (set of stats per user in this group)
    userId: String
    completedCount: Number
    completedMinutes: Number


Actions:
recordCompletion(userId: String, actualTime: Number, groupId: String)
  Requires: groupId ∈ Groups, userId exists in that group, actualTime > 0
  Effects: 
    - If the group's confirmationRequired = true, only increment stats if the task was confirmed
    - Increments completedCount and adds actualTime to completedMinutes for the user in that group

getLeaderboardByTasks(groupId: String) → List<(userId: String, completedCount: Number)>
  Requires: groupId ∈ Groups
  Effects: Returns ranking of users by completedCount within the specified group

getLeaderboardByTime(groupId: String) → List<(userId: String, completedHours: Number)>
  Requires: groupId ∈ Groups
  Effects: Returns ranking of users by total hours completed (completedMinutes ÷ 60) within the specified group

resetWeeklyStats()
  Requires: Start of new week
  Effects: 
    - Resets completedCount and completedMinutes for all users in all groups
    - Updates weekStart to the new week
    - Optionally archives previous week’s leaderboard for historical reference