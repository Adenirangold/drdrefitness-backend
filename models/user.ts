const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema(
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
        phone: {
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
            name: {
                type: String,
                required: true,
            },
            phone: {
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

        isActive: {
            type: Boolean,
            default: true,
        },

        currentSubscription: {
            plan: {
                type: Schema.Types.ObjectId,
                ref: "MembershipPlan",
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
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["active", "expired", "cancelled", "suspended"],
                    required: true,
                },
                startDate: {
                    type: Date,
                    required: true,
                },
                endDate: {
                    type: Date,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports= User;
