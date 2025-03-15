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

export const currentSubscriptionSchema = z.object({
  plan: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),

  startDate: z.coerce.date(),
});

const adminLocationSchema = z.object({
  location: z.string().min(2).max(50),
  branch: z.string().min(2).max(50),
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
    isActive: z.boolean().default(false),
    currentSubscription: currentSubscriptionSchema,
    adminLocation: adminLocationSchema.optional().nullable(),
    passwordResetToken: z.string().optional(),
    passwordExpiredAt: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.role !== "admin" ||
      (data.adminLocation !== undefined && data.adminLocation !== null),
    { message: "Admin location is required for admin role" }
  );

export const groupMemberSchema = memberSchema.innerType().pick({
  email: true,
  regNumber: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  address: true,
  emergencyContact: true,
  healthInfo: true,
  gender: true,
  dateOfBirth: true,
  profilePicture: true,
});
export const adminSchema = memberSchema.innerType().pick({
  email: true,
  regNumber: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  phoneNumber: true,
  adminLocation: true,
});

export const loginSchema = memberSchema.innerType().pick({
  email: true,
  password: true,
});
export const emailAloneSchema = memberSchema.innerType().pick({
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
  planId: z.string().min(2).max(50),
  planType: z.enum(["individual", "couple", "family"]).default("family"),
  name: z.string().min(2).max(50),
  gymLocation: z.string().min(2).max(50),
  gymBranch: z.string().min(2).max(50),
  benefits: z.array(z.string()),
  price: z.coerce.number().positive(),
  duration: z.coerce.number().positive(),
});
export const updatePlanSchema = planSchema.omit({ planId: true }).partial();
