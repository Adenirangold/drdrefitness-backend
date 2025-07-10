import mongoose from "mongoose";
import { Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    applicablePlans: [
      {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
    ],
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      min: 0,
      default: null,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ validFrom: 1, validUntil: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
