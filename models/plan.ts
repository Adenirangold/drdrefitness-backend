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
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
