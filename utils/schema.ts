import mongoose from "mongoose";
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
  plan: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
  status: z
    .enum(["active", "expired", "suspended", "cancelled"])
    .default("active"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  autoRenew: z.boolean().default(false),
  paymentMethod: z.enum(["card", "bank", "cash"]).default("card"),
  paymentStatus: z.enum(["pending", "approved", "declined"]).default("pending"),
  transactionId: z.string().optional(),
});

export const memberSchema = z
  .object({
    regNumber: z.string().min(2).max(50),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    phoneNumber: z.string().min(11).max(15),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(["male", "female"]),
    profilePicture: z.string().optional(),
    address: addressSchema,
    emergencyContact: emergencyContactSchema,
    healthInfo: healthInfoSchema.optional(),
    role: z.enum(["member", "admin", "director"]).default("member"),
    isActive: z.boolean().default(true),
    currentSubscription: currentSubscriptionSchema,
    adminLocation: z.string().optional().nullable(),
    passwordResetToken: z.string().optional(),
    passwordExpiredAt: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.role !== "admin" ||
      (data.adminLocation !== undefined && data.adminLocation !== null),
    { message: "Admin location is required for admin role" }
  );

export const loginSchema = memberSchema.innerType().pick({
  email: true,
  password: true,
});
export const forgotPasswordSchema = memberSchema.innerType().pick({
  email: true,
});

export const memberUpdateSchema = memberSchema.innerType().partial();

export const passwordUpdateSchema = memberSchema
  .innerType()
  .pick({
    password: true,
  })
  .extend({
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const passwordresetSchema = z
  .object({
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const planSchema = z.object({
  name: z.string().min(2).max(50),
  gymLocation: z.string().min(2).max(50),
  gymBranch: z.string().min(2).max(50),
  benefits: z.array(z.string()),
  price: z.coerce.number().positive(),
  duration: z.coerce.number().positive(),
});
