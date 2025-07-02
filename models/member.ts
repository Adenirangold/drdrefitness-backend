import mongoose from "mongoose";
import { Role, SubscriptionData, UserInput } from "../types";
import { calculateEndDate, hashPassword } from "../lib/util";
import Plan from "./plan";

const Schema = mongoose.Schema;

const paymentLogSchema = new Schema(
  {
    branch: {
      type: String,
      required: true,
      unique: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    transactionCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        transactionDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);
paymentLogSchema.index({ "transactions.transactionDate": 1 });

export const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);

const counterSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  count: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

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
    registrationDate: {
      type: Date,
      default: function (this: { role: Role }) {
        if (this.role === "member") {
          return new Date();
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
      authorizationCode: { type: String },
      subscriptionCode: { type: String, index: true },
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

    isGroup: {
      type: Boolean,
      default: function (this: { role: Role }) {
        if (this.role === "member") {
          return false;
        }

        return undefined;
      },
    },
    groupRole: {
      type: String,
      enum: ["primary", "dependant", "none"],
      default: function (this: { role: Role }) {
        if (this.role === "member") {
          return "none";
        }

        return undefined;
      },
    },

    groupSubscription: {
      groupType: {
        type: String,
        enum: ["couple", "family"],
        required: function (this: any) {
          return this?.isGroup === true;
        },
      },

      groupMaxMember: {
        type: Number,
        default: function (this: any) {
          if (this.role === "member") {
            if (
              this.groupSubscription &&
              this.groupSubscription.groupType === "couple"
            )
              return 1;
            if (
              this.groupSubscription &&
              this.groupSubscription.groupType === "family"
            )
              return 3;
          }

          return undefined;
        },
      },
      groupInviteToken: {
        type: String,
      },
      primaryMember: {
        type: Schema.Types.ObjectId,
        ref: "Member",
        required: function (this: any) {
          return this?.isGroup === true && this?.groupRole === "dependant";
        },
      },
      dependantMembers: [
        {
          member: {
            type: Schema.Types.ObjectId,
            ref: "Member",
            required: function (this: any) {
              return this?.isGroup === true && this?.groupRole === "primary";
            },
          },
          status: {
            type: String,
            enum: ["pending", "active", "removed"],
            required: function (this: any) {
              return this?.isGroup === true && this?.groupRole === "primary";
            },
          },
          joinedAt: {
            type: Date,
            required: function (this: any) {
              return this?.isGroup === true && this?.groupRole === "primary";
            },
          },
        },
      ],
    },

    passwordResetToken: String,
    passwordExpiredAt: Date,
  },
  { timestamps: true }
);

memberSchema.index({ role: 1 });
memberSchema.index({ "currentSubscription.plan": 1 });
memberSchema.index({ "currentSubscription.subscriptionStatus": 1 });
memberSchema.index({ isGroup: 1, groupRole: 1 });
memberSchema.index({ "groupSubscription.primaryMember": 1 });
memberSchema.index({ "groupSubscription.dependantMembers.member": 1 });
memberSchema.index({ "adminLocation.branch": 1 });
memberSchema.index({ createdAt: -1 });

memberSchema.pre("save", async function (next) {
  const member = this;

  // if (member.role !== "member") {
  //   return next();
  // }
  if (!member.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { collectionName: "members" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const paddedCount = String(counter.count).padStart(4, "0");
    member.regNumber = `REG-${paddedCount}`;

    next();
  } catch (error) {
    next(error as Error);
  }
});

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
      subscription?.endDate &&
      subscription?.paymentStatus === "approved"
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
    const endDate = new Date(this.currentSubscription.endDate);

    if (endDate < currentDate) {
      this.currentSubscription.subscriptionStatus = "expired";
    }
  }
  next();
});

memberSchema.pre("save", function (next) {
  if (this.role !== "member" && this.membershipHistory.length === 0) {
    (this as any).membershipHistory = undefined;
    (this as any).groupSubscription = undefined;
    (this as any).groupSubscription.dependantMembers = undefined;
  }
  next();
});
memberSchema.pre("save", function (next) {
  if (this.isGroup === false) {
    this.groupSubscription = undefined;
  }
  next();
});
memberSchema.pre("save", function (next) {
  if (this.groupRole === "dependant") {
    (this as any).groupSubscription.dependantMembers = undefined;
    (this as any).groupSubscription.groupMaxMember = undefined;
  }
  next();
});

memberSchema.pre("save", async function (next) {
  if (
    this.role === "member" &&
    this.isModified("currentSubscription.paymentStatus") &&
    this.currentSubscription?.paymentStatus === "approved" &&
    this.currentSubscription.plan &&
    (!this.isGroup || (this.isGroup && this.groupRole === "primary"))
  ) {
    try {
      const plan = await Plan.findById(this.currentSubscription.plan);
      if (plan) {
        const transactionDate =
          this.currentSubscription.startDate || new Date();
        await PaymentLog.findOneAndUpdate(
          { branch: plan.gymBranch },
          {
            $inc: {
              totalAmount: plan.price,
              transactionCount: 1,
            },
            $setOnInsert: {
              branch: plan.gymBranch,
            },
            $push: {
              transactions: {
                amount: plan.price,
                transactionDate,
              },
            },
          },
          { upsert: true, new: true }
        );
      }

      next();
    } catch (error) {
      next();
    }
  } else {
    next();
  }
});

const Member = mongoose.model("Member", memberSchema);
export default Member;
