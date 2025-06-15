import mongoose from "mongoose";

const checkInOutEntrySchema = new mongoose.Schema({
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
  },
  branchId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["checked-in", "checked-out"],
    default: "checked-in",
  },
});

const checkInOutHistorySchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
    unique: true,
  },
  history: [checkInOutEntrySchema],
});

const CheckInOutHistory = mongoose.model(
  "CheckInOutHistory",
  checkInOutHistorySchema
);
