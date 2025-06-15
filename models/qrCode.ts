import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  branchId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30, // Auto-delete after 30 seconds
  },
  type: {
    type: String,
    enum: ["check-in-out"],
    default: "check-in-out",
  },
});

const QRCodeModel = mongoose.model("QRCode", qrCodeSchema);
