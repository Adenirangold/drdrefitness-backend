import mongoose from "mongoose";
import { Role, SubscriptionData, UserInput } from "../types";
import { calculateEndDate, hashPassword } from "../lib/util";
import Plan from "./plan";

const Schema = mongoose.Schema;

const memberSchema = new Schema(
  {
    regNumber: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    profilePicture: {
      type: String,
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
        default: function (this: { role: Role }) {
          if (this.role === "member") {
            return "Nigeria";
          }

          return undefined;
        },
      },
    },

    emergencyContact: {
      fullName: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      relationship: {
        type: String,
      },
    },
    healthInfo: {
      height: Number,
      weight: Number,
      medicalConditions: { type: [String], default: undefined },
      allergies: { type: [String], default: undefined },
    },
    role: {
      type: String,
      enum: ["member", "admin", "director"],
      default: "member",
    },

    adminLocation: {
      type: {
        location: {
          type: String,
          minlength: 2,
          maxlength: 50,
        },
        branch: {
          type: String,
          minlength: 2,
          maxlength: 50,
        },
      },
      required: function (this: UserInput) {
        return this?.role === "admin";
      },
      validate: {
        validator: function (this: {
          role: string;
          adminLocation?: { location: string; branch: string };
        }) {
          return (
            this.role !== "admin" ||
            (this.adminLocation !== undefined &&
              this.adminLocation !== null &&
              this.adminLocation.location &&
              this.adminLocation.branch)
          );
        },
        message:
          "adminLocation with valid location and branch is required for admin role",
      },
    },
    isActive: {
      type: Boolean,
      default: function (this: { role: Role }) {
        if (this.role === "member") {
          return false;
        }

        return undefined;
      },
    },

    currentSubscription: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
      subscriptionStatus: {
        type: String,
        enum: ["inactive", "active", "expired", "cancelled"],
        default: function (this: { role: Role }) {
          if (this.role === "member") {
            return "inactive";
          }

          return undefined;
        },
      },

      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: function (this: { role: Role }) {
          if (this.role === "member") {
            return false;
          }

          return undefined;
        },
      },
      paymentMethod: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: function (this: { role: Role }) {
          if (this.role === "member") {
            return "pending";
          }
          return undefined;
        },
      },
      transactionReference: String,
    },

    membershipHistory: [
      {
        plan: {
          type: Schema.Types.ObjectId,
          ref: "Plan",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
      },
    ],

    passwordResetToken: String,
    passwordExpiredAt: Date,
  },
  { timestamps: true }
);

memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await hashPassword(this.password!);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});
memberSchema.pre("save", function () {
  if (this.role !== "admin") {
    this.adminLocation = undefined;
  }
});

memberSchema.pre("save", async function (next) {
  if (this.currentSubscription && this.currentSubscription.plan) {
    try {
      const plan = await Plan.findById(this.currentSubscription.plan);

      if (plan && this.currentSubscription.startDate) {
        const endPlanDate = calculateEndDate(
          this.currentSubscription.startDate,
          plan.duration
        );

        this.currentSubscription.endDate = new Date(endPlanDate);
      }

      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

memberSchema.pre("save", function (next) {
  if (this.role === "member" && this.isModified("currentSubscription")) {
    const subscription = this.currentSubscription;

    if (
      subscription?.plan &&
      subscription?.startDate &&
      subscription?.endDate
    ) {
      const historyEntry = {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      };
      this.membershipHistory.unshift(historyEntry);

      if (this?.membershipHistory?.length > 6) {
        this.membershipHistory.splice(6);
      }
    }
  }

  next();
});
memberSchema.pre("save", function (next) {
  if (this.currentSubscription && this.currentSubscription.endDate) {
    const currentDate = new Date();
    if (this.currentSubscription.endDate < currentDate) {
      this.currentSubscription.subscriptionStatus = "expired";
    }
  }
  next();
});
memberSchema.pre("save", function (next) {
  if (this.role !== "member" && this.membershipHistory.length === 0) {
    (this as any).membershipHistory = undefined;
  }
  next();
});

const Member = mongoose.model("Member", memberSchema);
export default Member;
