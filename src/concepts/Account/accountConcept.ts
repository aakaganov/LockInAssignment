// src/concepts/Account/AccountConcept.ts
import {
  addUser,
  deleteUser,
  getUser,
  loginUser,
  updateUser,
} from "./account.ts";

export default class AccountConcept {
  async addUser(
    { name, email, password }: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    const result = await addUser(name, email, password);
    if (result.error) return { error: result.error };
    return {
      message: result.message,
      user: { userId: result.userId, name: result.name, email: result.email },
    };
  }

  async loginUser({ email, password }: { email: string; password: string }) {
    console.log("[AccountConcept] loginUser called with:", { email, password });

    const user = await loginUser(email, password);

    if (user.error) {
      console.error("[AccountConcept] loginUser error:", user.error);
      return { error: user.error };
    }

    console.log("[AccountConcept] loginUser success:", {
      userId: user.userId,
      name: user.name,
      email: user.email,
    });

    return {
      message: "Login successful",
      user: { userId: user.userId, name: user.name, email: user.email },
    };
  }

  async updateUser(
    { userId, name, email, password }: {
      userId: string;
      name: string;
      email: string;
      password?: string;
    },
  ) {
    const result = await updateUser(userId, name, email, password);
    if (result.error) return { error: result.error };
    return {
      message: result.message,
      user: { userId, name, email },
    };
  }

  async getUser({ userId }: { userId: string }) {
    const result = await getUser(userId);
    if (result.error) return { error: result.error };

    return {
      user: {
        userId: userId,
        name: result.name,
        email: result.email,
      },
    };
  }

  async deleteUser({ userId }: { userId: string }) {
    const result = await deleteUser(userId);
    if (result.error) return { error: result.error };
    return { message: result.message };
  }

  async logoutUser({ userId }: { userId: string }) {
    console.log(`[AccountConcept] logoutUser called for userId: ${userId}`);
    return { message: `User ${userId} logged out successfully` };
  }
}
