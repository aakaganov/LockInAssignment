export interface User {
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

// In-memory store for users
export const Users = new Map<string, User>();

/**
 * Add a new user
 */
export function addUser(userId: string, name: string, email: string) {
  if (Users.has(userId)) {
    throw new Error(`User ${userId} already exists`);
  }

  const newUser: User = {
    userId,
    name,
    email,
    createdAt: new Date(),
  };

  Users.set(userId, newUser);
}

/**
 * Retrieve user info
 */
export function getUser(userId: string): { name: string; email: string } {
  const user = Users.get(userId);
  if (!user) {
    throw new Error(`User ${userId} does not exist`);
  }

  return {
    name: user.name,
    email: user.email,
  };
}

/**
 * Delete a user
 */
export function deleteUser(userId: string) {
  if (!Users.has(userId)) {
    throw new Error(`User ${userId} does not exist`);
  }

  Users.delete(userId);
}
