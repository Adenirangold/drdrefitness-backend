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

export const planSchema = z.object({
  planType: z.enum(["individual", "couple", "family"]).default("individual"),
  name: z.string().min(2).max(50),
  gymLocation: z.string().min(2).max(50),
  gymBranch: z.string().min(2).max(50),
  benefits: z.array(z.string()),
  price: z.coerce.number().positive(),
  duration: z.coerce.number().positive(),
});

export const currentSubscriptionSchema = planSchema.pick({
  planType: true,
  name: true,
  gymBranch: true,
  gymLocation: true,
});

export const adminLocationSchema = z.object({
  location: z.string().min(2).max(50),
  branch: z.string().min(2).max(50),
});
export const stationSchema = planSchema.pick({
  gymBranch: true,
  gymLocation: true,
});

export const memberSchema = z
  .object({
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

export const groupMemberSchema = memberSchema
  .innerType()
  .pick({
    email: true,
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
  })
  .partial()
  .extend({
    email: z.string().email(),
  });
export const adminSchema = memberSchema.innerType().pick({
  email: true,
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

export const memberUpdateSchema = memberSchema
  .innerType()
  .extend({
    emergencyContact: emergencyContactSchema.partial().optional(),
    address: addressSchema.partial().optional(),
  })
  .partial();

export const passwordUpdateSchema = memberSchema
  .innerType()
  .pick({
    password: true,
  })
  .extend({
    newPassword: z.string().min(6),
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

export const reactivateSubscriptionSchema = planSchema.partial();
export const updatePlanSchema = planSchema.partial();
export const updateAdminSchema = adminSchema.partial();

export const idOnlySchema = z.object({
  id: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
});
export const staionSchema = z.object({
  id: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
});

export const checkInOutSchema = z.object({
  stationId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),

  token: z.string(),
});
export const checkInOutHistorySchema = z.object({
  memberId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
  history: z.array(
    z.object({
      checkInTime: z.coerce.date(),
      checkOutTime: z.coerce.date().optional(),
      stationId: z
        .string()
        .refine(
          (val) => mongoose.Types.ObjectId.isValid(val),
          "Invalid ObjectId"
        ),
      status: z.enum(["checked-in", "checked-out"]).default("checked-in"),
    })
  ),
});
