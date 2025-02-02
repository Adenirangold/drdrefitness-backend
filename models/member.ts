import mongoose from "mongoose";
import { SubscriptionData, UserInput } from "../types";
import bcrypt from "bcryptjs";
import { hashPassword } from "../lib/util";

const Schema = mongoose.Schema;

const memberSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profilePicture: {
      type: String,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "Nigeria",
      },
    },

    emergencyContact: {
      fullName: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
    },
    healthInfo: {
      height: Number,
      weight: Number,
      medicalConditions: [String],
      allergies: [String],
    },
    role: {
      type: String,
      enum: ["user", "admin", "coach", "director"],
      default: "user",
    },
    adminlocation: {
      type: String,
      required: function (this: UserInput) {
        return this?.role === "admin";
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currentSubscription: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
      status: {
        type: String,
        enum: ["active", "expired", "suspended", "cancelled"],
        default: "active",
      },
      startDate: Date,
      endDate: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
      paymentMethod: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending",
      },
      transactionId: String,
    },

    membershipHistory: [
      {
        plan: {
          type: Schema.Types.ObjectId,
          ref: "MembershipPlan",
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

memberSchema.pre("save", function (next) {
  if (this.isModified("currentSubscription")) {
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

memberSchema.methods.updateSubscription = async function (
  subscriptionData: SubscriptionData
) {
  this.currentSubscription = {
    ...this.currentSubscription.toObject(),
    ...subscriptionData,
  };
  await this.save();
  return this;
};

const Member = mongoose.model("Member", memberSchema);
export default Member;
