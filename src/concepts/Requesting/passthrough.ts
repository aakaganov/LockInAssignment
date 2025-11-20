/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // FriendGroup
  "/api/FriendGroup/acceptInvite": "users accepting invites is safe",
  "/api/FriendGroup/declineInvite": "users declining invites is safe",
  "/api/FriendGroup/inviteUserByEmail": "users inviting others is safe",
  "/api/FriendGroup/listGroups": "safe read-only query",
  "/api/FriendGroup/leaveGroup":
    "users leaving a group is safe; requires user auth",

  // LikertSurvey
  "/api/LikertSurvey/submitResponse": "allow users to submit responses",
  "/api/LikertSurvey/updateResponse":
    "allow users to update their own response",
  "/api/LikertSurvey/_getSurveyQuestions": "safe read-only",

  // Notification
  "/api/Notification/list": "users fetching their notifications is safe",
  "/api/Notification/updateStatus": "marking notifications read/unread is safe",

  // ConfirmTask
  "/api/ConfirmTask/requestConfirmation":
    "users requesting confirmation is normal",
  "/api/ConfirmTask/getConfirmations": "read-only; safe for user",
  "/api/ConfirmTask/getPendingConfirmationsForPeer":
    "read-only for users; safe",
  "/api/ConfirmTask/finalizeConfirmation": "",
  "/api/ConfirmTask/denyTask": "",

  // Leaderboard
  "/api/Leaderboard/recordCompletion": "read-only; safe",
  "/api/Leaderboard/resetWeeklyStats": "read-only; safe",
  "/api/Leaderboard/getLeaderboardByTasks": "read-only; safe",
  "/api/Leaderboard/getLeaderboardByTime": "read-only; safe",

  // Requesting
  "/api/Requesting/request": "needed for sync requests",
  "/api/Requesting/respond": "needed for sync requests",
  "/api/Requesting/_awaitResponse": "needed for sync requests",

  // Task
  "/api/Task/listTasks": "safe read-only query",
  "/api/Task/editTask": "safe to edit descriptors of task",
  "/api/Task/suggestTaskOrder":
    "Uses AI to suggest task ordering; safe read-only",
  "/api/Task/createTask": "Users creating tasks for themselve",

  // Account
  "/api/Account/addUser": "user sign-up is normal",
  "/api/Account/loginUser": "user login is safe",
  "/api/Account/getUser": "reading own info is safe",
  "/api/Account/logoutUser": "safe to include",
  "/api/Account/updateUser": "",
  "/api/Account/deleteUser": "",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // FriendGroup
  "/api/FriendGroup/createGroup",
  "/api/FriendGroup/removeMember",
  "/api/FriendGroup/setConfirmationPolicy",
  "/api/FriendGroup/deleteGroup",

  // LikertSurvey
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",
  "/api/LikertSurvey/_getSurveyResponses",
  "/api/LikertSurvey/_getRespondentAnswers",

  // Notification
  "/api/Notification/create",
  "/api/Notification/delete",

  // ConfirmTask
  "/api/ConfirmTask/confirmTask",

  // Task

  "/api/Task/completeTask",
  "/api/Task/deleteTask",
];
