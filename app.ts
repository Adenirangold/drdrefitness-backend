import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";
import planRoute from "./routes/planRoute";
import authRoute from "./routes/authRoute";

dotenv.config();
const app = express();

app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://yourdomain.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/members", memberRoute);
app.use("/api/plans", planRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      validationErrors: err.validationErrors,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        validationErrors: err.validationErrors,
      });
    } else {
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
});

connectDatabase();
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
