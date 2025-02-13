import { z } from "zod";
export declare const memberSchema: z.ZodEffects<z.ZodObject<{
    regNumber: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phoneNumber: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female"]>;
    profilePicture: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    }>;
    emergencyContact: z.ZodObject<{
        fullName: z.ZodString;
        phoneNumber: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }>;
    healthInfo: z.ZodOptional<z.ZodObject<{
        height: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }>>;
    role: z.ZodDefault<z.ZodEnum<["member", "admin", "director"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    currentSubscription: z.ZodObject<{
        plan: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodDefault<z.ZodEnum<["active", "expired", "suspended", "cancelled"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        autoRenew: z.ZodDefault<z.ZodBoolean>;
        paymentMethod: z.ZodDefault<z.ZodEnum<["card", "bank", "cash"]>>;
        paymentStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "declined"]>>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    }, {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    }>;
    adminLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    passwordResetToken: z.ZodOptional<z.ZodString>;
    passwordExpiredAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    gender: "male" | "female";
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    emergencyContact: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    };
    role: "member" | "admin" | "director";
    isActive: boolean;
    currentSubscription: {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    };
    profilePicture?: string | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}, {
    phoneNumber: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    gender: "male" | "female";
    address: {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    };
    emergencyContact: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    };
    currentSubscription: {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    };
    profilePicture?: string | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    role?: "member" | "admin" | "director" | undefined;
    isActive?: boolean | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}>, {
    phoneNumber: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    gender: "male" | "female";
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    emergencyContact: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    };
    role: "member" | "admin" | "director";
    isActive: boolean;
    currentSubscription: {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    };
    profilePicture?: string | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}, {
    phoneNumber: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    gender: "male" | "female";
    address: {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    };
    emergencyContact: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    };
    currentSubscription: {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    };
    profilePicture?: string | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    role?: "member" | "admin" | "director" | undefined;
    isActive?: boolean | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}>;
export declare const loginSchema: z.ZodObject<Pick<{
    regNumber: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phoneNumber: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female"]>;
    profilePicture: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    }>;
    emergencyContact: z.ZodObject<{
        fullName: z.ZodString;
        phoneNumber: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }>;
    healthInfo: z.ZodOptional<z.ZodObject<{
        height: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }>>;
    role: z.ZodDefault<z.ZodEnum<["member", "admin", "director"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    currentSubscription: z.ZodObject<{
        plan: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodDefault<z.ZodEnum<["active", "expired", "suspended", "cancelled"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        autoRenew: z.ZodDefault<z.ZodBoolean>;
        paymentMethod: z.ZodDefault<z.ZodEnum<["card", "bank", "cash"]>>;
        paymentStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "declined"]>>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    }, {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    }>;
    adminLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    passwordResetToken: z.ZodOptional<z.ZodString>;
    passwordExpiredAt: z.ZodOptional<z.ZodDate>;
}, "email" | "password">, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<Pick<{
    regNumber: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phoneNumber: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female"]>;
    profilePicture: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    }>;
    emergencyContact: z.ZodObject<{
        fullName: z.ZodString;
        phoneNumber: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }>;
    healthInfo: z.ZodOptional<z.ZodObject<{
        height: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }>>;
    role: z.ZodDefault<z.ZodEnum<["member", "admin", "director"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    currentSubscription: z.ZodObject<{
        plan: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodDefault<z.ZodEnum<["active", "expired", "suspended", "cancelled"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        autoRenew: z.ZodDefault<z.ZodBoolean>;
        paymentMethod: z.ZodDefault<z.ZodEnum<["card", "bank", "cash"]>>;
        paymentStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "declined"]>>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    }, {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    }>;
    adminLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    passwordResetToken: z.ZodOptional<z.ZodString>;
    passwordExpiredAt: z.ZodOptional<z.ZodDate>;
}, "email">, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const memberUpdateSchema: z.ZodObject<{
    regNumber: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodDate>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female"]>>;
    profilePicture: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    }>>;
    emergencyContact: z.ZodOptional<z.ZodObject<{
        fullName: z.ZodString;
        phoneNumber: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }>>;
    healthInfo: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        height: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }>>>;
    role: z.ZodOptional<z.ZodDefault<z.ZodEnum<["member", "admin", "director"]>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    currentSubscription: z.ZodOptional<z.ZodObject<{
        plan: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodDefault<z.ZodEnum<["active", "expired", "suspended", "cancelled"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        autoRenew: z.ZodDefault<z.ZodBoolean>;
        paymentMethod: z.ZodDefault<z.ZodEnum<["card", "bank", "cash"]>>;
        paymentStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "declined"]>>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    }, {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    }>>;
    adminLocation: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    passwordResetToken: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    passwordExpiredAt: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    phoneNumber?: string | undefined;
    regNumber?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | undefined;
    profilePicture?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
    } | undefined;
    emergencyContact?: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    } | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    role?: "member" | "admin" | "director" | undefined;
    isActive?: boolean | undefined;
    currentSubscription?: {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    } | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}, {
    phoneNumber?: string | undefined;
    regNumber?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    dateOfBirth?: Date | undefined;
    gender?: "male" | "female" | undefined;
    profilePicture?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    } | undefined;
    emergencyContact?: {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    } | undefined;
    healthInfo?: {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    } | undefined;
    role?: "member" | "admin" | "director" | undefined;
    isActive?: boolean | undefined;
    currentSubscription?: {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    } | undefined;
    adminLocation?: string | null | undefined;
    passwordResetToken?: string | undefined;
    passwordExpiredAt?: Date | undefined;
}>;
export declare const passwordUpdateSchema: z.ZodEffects<z.ZodObject<z.objectUtil.extendShape<Pick<{
    regNumber: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phoneNumber: z.ZodString;
    dateOfBirth: z.ZodDate;
    gender: z.ZodEnum<["male", "female"]>;
    profilePicture: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        country: string;
    }, {
        street: string;
        city: string;
        state: string;
        country?: string | undefined;
    }>;
    emergencyContact: z.ZodObject<{
        fullName: z.ZodString;
        phoneNumber: z.ZodString;
        relationship: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }, {
        fullName: string;
        phoneNumber: string;
        relationship: string;
    }>;
    healthInfo: z.ZodOptional<z.ZodObject<{
        height: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        medicalConditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }, {
        height?: number | undefined;
        weight?: number | undefined;
        medicalConditions?: string[] | undefined;
        allergies?: string[] | undefined;
    }>>;
    role: z.ZodDefault<z.ZodEnum<["member", "admin", "director"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    currentSubscription: z.ZodObject<{
        plan: z.ZodEffects<z.ZodString, string, string>;
        status: z.ZodDefault<z.ZodEnum<["active", "expired", "suspended", "cancelled"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodDate;
        autoRenew: z.ZodDefault<z.ZodBoolean>;
        paymentMethod: z.ZodDefault<z.ZodEnum<["card", "bank", "cash"]>>;
        paymentStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "declined"]>>;
        transactionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "expired" | "suspended" | "cancelled";
        plan: string;
        startDate: Date;
        endDate: Date;
        autoRenew: boolean;
        paymentMethod: "card" | "bank" | "cash";
        paymentStatus: "pending" | "approved" | "declined";
        transactionId?: string | undefined;
    }, {
        plan: string;
        startDate: Date;
        endDate: Date;
        status?: "active" | "expired" | "suspended" | "cancelled" | undefined;
        autoRenew?: boolean | undefined;
        paymentMethod?: "card" | "bank" | "cash" | undefined;
        paymentStatus?: "pending" | "approved" | "declined" | undefined;
        transactionId?: string | undefined;
    }>;
    adminLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    passwordResetToken: z.ZodOptional<z.ZodString>;
    passwordExpiredAt: z.ZodOptional<z.ZodDate>;
}, "password">, {
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    password: string;
    newPassword: string;
    confirmPassword: string;
}, {
    password: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    password: string;
    newPassword: string;
    confirmPassword: string;
}, {
    password: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const passwordresetSchema: z.ZodEffects<z.ZodObject<{
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    confirmPassword: string;
}, {
    newPassword: string;
    confirmPassword: string;
}>, {
    newPassword: string;
    confirmPassword: string;
}, {
    newPassword: string;
    confirmPassword: string;
}>;
export declare const planSchema: z.ZodObject<{
    name: z.ZodString;
    gymLocation: z.ZodString;
    gymBranch: z.ZodString;
    benefits: z.ZodArray<z.ZodString, "many">;
    price: z.ZodNumber;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    gymLocation: string;
    gymBranch: string;
    benefits: string[];
    price: number;
    duration: number;
}, {
    name: string;
    gymLocation: string;
    gymBranch: string;
    benefits: string[];
    price: number;
    duration: number;
}>;
//# sourceMappingURL=schema.d.ts.map