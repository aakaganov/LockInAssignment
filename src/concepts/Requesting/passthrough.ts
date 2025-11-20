export const inclusions: Record<string, string> = {
  // ----------------------------------------
  // FriendGroup (only read-only or harmless)
  // ----------------------------------------
  "/FriendGroup/acceptInvite": "safe",
  "/FriendGroup/declineInvite": "safe",
  "/FriendGroup/listGroups": "safe read-only query",
  "/FriendGroup/leaveGroup": "users leaving a group is safe",

  // ----------------------------------------
  // LikertSurvey
  // ----------------------------------------
  "/LikertSurvey/submitResponse": "safe",
  "/LikertSurvey/updateResponse": "safe",
  "/LikertSurvey/_getSurveyQuestions": "read-only",

  // ----------------------------------------
  // Notification (READ ONLY)
  // ----------------------------------------
  "/Notification/list": "safe read-only",
  "/Notification/updateStatus": "clients marking notifications read is safe",

  // ----------------------------------------
  // ConfirmTask (ONLY READ actions allowed)
  // ----------------------------------------
  "/ConfirmTask/requestConfirmation": "user-initiated request",
  "/ConfirmTask/getConfirmations": "read-only",
  "/ConfirmTask/getPendingConfirmationsForPeer": "read-only",

  // ----------------------------------------
  // Leaderboard
  // ----------------------------------------
  "/Leaderboard/recordCompletion": "read-only",
  "/Leaderboard/resetWeeklyStats": "read-only",
  "/Leaderboard/getLeaderboardByTasks": "read-only",
  "/Leaderboard/getLeaderboardByTime": "read-only",

  // ----------------------------------------
  // Requesting internal
  // ----------------------------------------
  "/Requesting/request": "required",
  "/Requesting/respond": "required",
  "/Requesting/_awaitResponse": "required",

  // ----------------------------------------
  // Task (ONLY read & edit allowed)
  // ----------------------------------------
  "/Task/listTasks": "safe read-only query",
  "/Task/editTask": "safe to edit fields",
  "/Task/suggestTaskOrder": "AI-based read-only suggestion",

  // ----------------------------------------
  // Account (public or read-only)
  // ----------------------------------------
  "/Account/addUser": "sign-up",
  "/Account/loginUser": "login",
  "/Account/getUser": "read-only",
  "/Account/logoutUser": "normal logout",
};

export const exclusions: Array<string> = [
  // ----------------------------------------
  // FriendGroup (must trigger sync)
  // ----------------------------------------
  "/FriendGroup/createGroup",
  "/FriendGroup/inviteUserByEmail",
  "/FriendGroup/removeMember",
  "/FriendGroup/setConfirmationPolicy",
  "/FriendGroup/deleteGroup",

  // ----------------------------------------
  // LikertSurvey
  // ----------------------------------------
  "/LikertSurvey/createSurvey",
  "/LikertSurvey/addQuestion",
  "/LikertSurvey/_getSurveyResponses",
  "/LikertSurvey/_getRespondentAnswers",

  // ----------------------------------------
  // Notification (MUST go through sync)
  // ----------------------------------------
  "/Notification/create",
  "/Notification/delete",

  // ----------------------------------------
  // ConfirmTask (MUST go through sync)
  // ----------------------------------------
  "/ConfirmTask/confirmTask",
  "/ConfirmTask/finalizeConfirmation",
  "/ConfirmTask/denyTask",

  // ----------------------------------------
  // Task (MUST go through sync)
  // ----------------------------------------
  "/Task/createTask",
  "/Task/completeTask",
  "/Task/deleteTask",

  // ----------------------------------------
  // Account (MUST go through sync)
  // ----------------------------------------
  "/Account/updateUser",
  "/Account/deleteUser",
];
