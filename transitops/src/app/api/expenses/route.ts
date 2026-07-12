import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { expenseSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const expenses = await db.expense.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(expenses, "Expenses retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch expenses.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = expenseSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newExpense = await db.expense.create({
      data: validationResult.data,
    });

    return sendSuccess(newExpense, "Expense recorded successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to record expense.", "INTERNAL_SERVER_ERROR", 500);
  }
}
