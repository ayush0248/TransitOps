"use client";

import { useAuth as useAuthFromProvider } from "@/providers/AuthProvider";

export { useAuthFromProvider as useAuth };
export type { AuthUser } from "@/providers/AuthProvider";
