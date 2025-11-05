import { freshID, getDb } from "../../utils/database.ts";

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

/** Add a new user */
export async function addUser(name: string, email: string, password: string) {
  const [db] = await getDb();
  const usersColl = db.collection<User>("users");

  // Check if email already exists
  const existing = await usersColl.findOne({ email });
  if (existing) return { error: "Email is already in use" };

  const userId = freshID();
  const newUser: User = {
    userId,
    name,
    email,
    password,
    createdAt: new Date(),
  };

  await usersColl.insertOne(newUser);
  return { message: "User added successfully", userId, name, email };
}

/** Login user */
export async function loginUser(email: string, password: string) {
  const [db] = await getDb();
  const usersColl = db.collection<User>("users");

  const user = await usersColl.findOne({ email });
  if (!user) return { error: `User with email ${email} does not exist` };
  if (user.password !== password) return { error: "Invalid password" };

  return {
    message: "Login successful",
    userId: user.userId,
    name: user.name,
    email: user.email,
  };
}

/** Get user info */
export async function getUser(userId: string) {
  const [db] = await getDb();
  const usersColl = db.collection<User>("users");

  const user = await usersColl.findOne({ userId });
  if (!user) return { error: `User ${userId} does not exist` };
  return { name: user.name, email: user.email };
}

/** Update user info */
export async function updateUser(
  userId: string,
  name: string,
  email: string,
  password?: string,
) {
  const [db] = await getDb();
  const usersColl = db.collection<User>("users");

  const user = await usersColl.findOne({ userId });
  if (!user) return { error: `User ${userId} does not exist` };

  const updateFields: Partial<User> = { name, email };
  if (password) updateFields.password = password;

  await usersColl.updateOne({ userId }, { $set: updateFields });
  return { message: "User updated successfully", userId, name, email };
}

/** Delete user */
export async function deleteUser(userId: string) {
  const [db] = await getDb();
  const usersColl = db.collection<User>("users");

  const result = await usersColl.deleteOne({ userId });
  if (result.deletedCount === 0) {
    return { error: `User ${userId} does not exist` };
  }
  return { message: "User deleted successfully" };
}
