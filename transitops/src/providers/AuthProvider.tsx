"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { DEFAULT_DASHBOARD_ROUTE } from "@/lib/constants";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: { email: string; password: string; role?: string }) => Promise<any>;
  register: (data: { name: string; email: string; password: string; role: Role }) => Promise<any>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: string[]) => boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Fetch current user from GET /api/auth/me
  const { data: meResponse, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    },
    retry: false,
  });

  const user = (meResponse as AuthUser) || null;

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; role?: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to sign in.");
      }
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.name}!`);
      queryClient.setQueryData(["auth", "me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      const targetRoute = DEFAULT_DASHBOARD_ROUTE[data.user.role as Role] || "/dashboard";
      router.push(targetRoute);
    },
    onError: (error: any) => {
      toast.error(error.message || "Sign in failed. Check credentials.");
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; role: Role }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to register.");
      }
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(`Account created! Welcome, ${data.user.name}.`);
      queryClient.setQueryData(["auth", "me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      const targetRoute = DEFAULT_DASHBOARD_ROUTE[data.user.role as Role] || "/dashboard";
      router.push(targetRoute);
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed.");
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("You have been signed out.");
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
      router.push("/login");
    },
  });

  const hasRole = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        hasRole,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
