import { z } from "zod";


export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["fleet_manager", "driver_user", "safety_officer", "financial_analyst"]),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.string().optional(),
});

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, "Registration number is required"),
  name: z.string().min(1, "Vehicle name is required"),
  model: z.string().optional(),
  type: z.string().min(1, "Vehicle type is required"),
  maxLoadCapacity: z.number().positive("Max load capacity must be greater than 0"),
  odometer: z.number().nonnegative("Odometer reading cannot be negative").default(0),
  acquisitionCost: z.number().nonnegative("Acquisition cost cannot be negative").default(0),
  revenue: z.number().nonnegative().default(0),
  region: z.string().optional(),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]).default("available"),
});

export const driverSchema = z.object({
  name: z.string().min(2, "Driver name is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.string().transform((str) => new Date(str)),
  contactNumber: z.string().optional(),
  safetyScore: z.number().min(0).max(100).default(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]).default("available"),
});

export const tripSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  cargoWeight: z.number().positive("Cargo weight must be greater than 0"),
  plannedDistance: z.number().positive("Planned distance must be positive"),
  actualDistance: z.number().nonnegative().optional().nullable(),
  fuelConsumed: z.number().nonnegative().optional().nullable(),
  status: z.enum(["draft", "dispatched", "completed", "cancelled"]).default("draft"),
  createdById: z.string().min(1, "User ID is required"),
});

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  description: z.string().min(3, "Description is required"),
  cost: z.number().nonnegative("Cost cannot be negative"),
  status: z.enum(["active", "closed"]).default("active"),
});

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  tripId: z.string().optional().nullable(),
  liters: z.number().positive("Liters must be positive"),
  cost: z.number().positive("Cost must be positive"),
});

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.enum(["maintenance", "toll", "insurance", "repair", "other"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.input<typeof driverSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type FuelLogInput = z.infer<typeof fuelLogSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
