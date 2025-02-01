import mongoose from "mongoose";

const Schema = mongoose.Schema;

const planSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  gymLocation: {
    type: String,
    required: true,
    trim: true,
  },

  gymBranch: {
    type: String,
    required: true,
    trim: true,
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
