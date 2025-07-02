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

checkInStationSchema.index({ gymBranch: 1 });
checkInStationSchema.index({ gymLocation: 1 });
checkInStationSchema.index({ qrCodeCreatedAt: 1 });
checkInStationSchema.index({ gymBranch: 1, gymLocation: 1 });
checkInStationSchema.index({ createdAt: -1 });

const CheckInStation = mongoose.model("CheckInStation", checkInStationSchema);
export default CheckInStation;
