import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

export function sendSuccess<T>(data: T, message: string = "Operation completed successfully.", status: number = 200) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(body, { status });
}

export function sendError(
  message: string = "Validation failed.",
  code: string = "VALIDATION_ERROR",
  status: number = 400,
  details?: any
) {
  const body: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details && { details }),
    },
  };
  return NextResponse.json(body, { status });
}
