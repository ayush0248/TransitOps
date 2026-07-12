import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { getAuthUser } from "@/lib/auth";
import { hashPassword } from "@/lib/bcrypt";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["fleet_manager", "driver_user", "safety_officer", "financial_analyst"]),
});

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "fleet_manager") {
      return sendError("Forbidden. Only Fleet Managers can view users.", "FORBIDDEN", 403);
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(users, "Users retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch users.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "fleet_manager") {
      return sendError("Forbidden. Only Fleet Managers can register new users.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const { name, email, password, role } = validationResult.data;

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError("A user with this email already exists.", "USER_EXISTS", 409);
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    return sendSuccess(newUser, "User registered successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to create user.", "INTERNAL_SERVER_ERROR", 500);
  }
}
