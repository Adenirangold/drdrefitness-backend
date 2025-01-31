import mongoose from "mongoose";

const connectDatabase = async function () {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("connected to database");
  } catch (err) {
    console.log("error connecting to database");
    console.log(err);
    process.exit(1);
  }
};

export default connectDatabase;
