import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  fleet_manager: "Fleet Manager",
  driver_user: "Dispatcher / Driver",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst",
};

export const ROLE_SCOPES: Record<Role, string> = {
  fleet_manager: "Fleet, Maintenance & Vehicle Assignment",
  driver_user: "Dashboard, Trip Dispatch & Status",
  safety_officer: "Drivers, Compliance & Safety Scores",
  financial_analyst: "Fuel & Expenses, ROI & Analytics",
};

export const DEFAULT_DASHBOARD_ROUTE: Record<Role, string> = {
  fleet_manager: "/vehicles",
  driver_user: "/trips",
  safety_officer: "/safety",
  financial_analyst: "/reports",
};

export const AUTH_COOKIE_NAME = "token";
