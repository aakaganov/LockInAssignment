Purpose: Enable peer confirmation of task completion.
Principle: External accountability increases follow-through.

State:
Confirmations: a set of
 taskId: String
 requestedBy: String
 confirmedBy: Set<UserId>
 status: Enum { "pending", "verified" }

Actions:
requestConfirmation(taskId: String, requestedBy: String)
  Requires: task exists and status = completed
  Effects: Creates pending confirmation

confirmTask(taskId: String, peerId: String)
  Requires: confirmation exists for taskId
  Effects: Adds peerId to confirmedBy

finalizeConfirmation(taskId: String)
  Requires: confirmedBy not empty
  Effects: Sets status = verified

getConfirmations(userId: String) → Set<Confirmation>
  Requires: none
  Effects: Lists confirmations requested by user

