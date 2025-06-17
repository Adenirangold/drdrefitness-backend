import mongoose from "mongoose";

const checkInStationSchema = new mongoose.Schema(
  {
    gymLocation: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    gymBranch: {
      type: String,
      required: [true, "Location is required"],
    },
    qrCodeToken: {
      type: String,
      unique: true,
    },
    qrCodeCreatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const CheckInStation = mongoose.model("CheckInStation", checkInStationSchema);
export default CheckInStation;
