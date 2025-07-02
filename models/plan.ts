import mongoose from "mongoose";

const Schema = mongoose.Schema;

const planSchema = new Schema({
  planId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  planType: {
    type: String,
    enum: ["individual", "couple", "family"],
    default: "individual",
  },

  gymLocation: {
    type: String,
    required: true,
  },

  gymBranch: {
    type: String,
    required: true,
  },

  benefits: {
    type: [String],
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  duration: {
    type: Number,
    required: true,
    min: 0,
  },

  paystackPlanCode: {
    type: String,
  },
});

planSchema.index({ gymBranch: 1 });
planSchema.index({ name: 1 });
planSchema.index({ gymLocation: 1 });
planSchema.index({ planType: 1 });
planSchema.index({ gymBranch: 1, gymLocation: 1 });
planSchema.index({ gymBranch: 1, gymLocation: 1, planType: 1 });
planSchema.index({ gymBranch: 1, gymLocation: 1, name: 1 });
planSchema.index({ gymBranch: 1, gymLocation: 1, planType: 1, name: 1 });
planSchema.index({ price: 1 });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
