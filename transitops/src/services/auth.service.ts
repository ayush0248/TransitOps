import db from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/bcrypt";
import { signToken } from "@/lib/jwt";
import { Role } from "@prisma/client";

export class AuthService {
  static async registerUser(input: { name: string; email: string; password: string; role: Role }) {
    const existingUser = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async loginUser(input: { email: string; password: string; role?: string }) {
    const user = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    // Optional RBAC check during login if dropdown role was explicitly specified and mismatched
    if (input.role && input.role !== "all" && user.role !== input.role && (input.role === "driver" && user.role !== "driver_user")) {
      throw new Error(`Role mismatch. Your account role is ${user.role}.`);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }
}
