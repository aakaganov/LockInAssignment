Purpose: Manage user identities and basic profile information.
Principle: Each user has a unique identity and can authenticate securely.

State:
Users: a set of
 userId: String
 name: String
 email: String
 createdAt: Date

Actions:

addUser(userId: String, name: String, email: String)
  Requires: userId ∉ Users
  Effects: Adds user to Users

getUser(userId: String) → (name: String, email: String)
  Requires: userId ∈ Users
  Effects: Returns user info

deleteUser(userId: String)
  Requires: userId ∈ Users
  Effects: Removes user from Users