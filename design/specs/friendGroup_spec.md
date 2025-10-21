Purpose: Form accountability groups between users.
Principle: Motivation increases through supportive peer groups.

State:
Groups: a set of
 groupId: String
 name: String
 members: Set<UserId>
 requiresConfirmation: Boolean (whether tasks require peer confirmation)

Actions:
createGroup(groupId: String, name: String, requiresConfirmation: Boolean)
  Requires: groupId ∉ Groups
  Effects: Creates group with empty member list

addMember(groupId: String, userId: String)
  Requires: groupId ∈ Groups
  Effects: Adds user to members

removeMember(groupId: String, userId: String)
  Requires: userId ∈ members of groupId
  Effects: Removes user from members

listGroups(userId: String) → Set<GroupId>
  Requires: none
  Effects: Returns all groups user belongs to

setConfirmationPolicy(groupId: String, requiresConfirmation: Boolean)
  Requires: groupId ∈ FriendGroups
  Effects: Updates whether tasks in the group require peer confirmation.