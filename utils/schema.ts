import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("Nigeria"),
});

const emergencyContactSchema = z.object({
  fullName: z.string().min(2).max(50),
  phoneNumber: z.string().min(11).max(15),
  relationship: z.string().min(2).max(50),
});

const healthInfoSchema = z.object({
  height: z.coerce.number().positive().optional(),
  weight: z.coerce.number().positive().optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

const currentSubscriptionSchema = z.object({
  plan: z.string().min(1, "Plan ID is required"),
  status: z
    .enum(["active", "expired", "suspended", "cancelled"])
    .default("active"),
  startDate: z.date(),
  endDate: z.date(),
  autoRenew: z.boolean().default(false),
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(["pending", "approved", "declined"]).default("pending"),
  transactionId: z.string().optional(),
});

export const memberSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(11).max(15),
  dateOfBirth: z.date(),
  gender: z.enum(["male", "female"]),
  profilePicture: z.string().optional(),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  healthInfo: healthInfoSchema,
  role: z.enum(["user", "admin", "coach", "director"]).default("user"),
  isActive: z.boolean().default(true),
  currentSubscription: currentSubscriptionSchema,
});
