import mongoose from "mongoose";

const checkInOutEntrySchema = new mongoose.Schema({
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 90 * 24 * 60 * 60, // 90 days
  },
  checkOutTime: {
    type: Date,
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CheckInStation",
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

export default CheckInOutHistory;
