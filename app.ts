import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";
import planRoute from "./routes/planRoute";
import authRoute from "./routes/authRoute";
import subscriptionRoute from "./routes/subscriptionRoute";
import groupRoute from "./routes/groupRoute";
import adminRoute from "./routes/adminRoute";
import directorRoute from "./routes/directorRoute";
import paystackRoute from "./routes/paystackRoute";
import workflowRoute from "./routes/workflowRoute";
import stationRoute from "./routes/stationRoute";
import checkInOutRoute from "./routes/checkInOutRoute";
import { configureSecurityMiddleware } from "./middleware/security";
import errorHandler from "./middleware/errorHandler";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import cors from "cors";
import { seedDatabase } from "./seed";
import { setupSocket } from "./config/socket";
import { setupCronJobs } from "./cron/updateSubsriptionStatus";
import {
  cancelPaystackSubscription,
  updateExistingPlans,
} from "./config/paystack";

dotenv.config();
const app = express();

const server = http.createServer(app);
const ioServer = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "https://4d7f-105-113-81-163.ngrok-free.app/",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://4d7f-105-113-81-163.ngrok-free.app/",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
configureSecurityMiddleware(app);

app.use("/api/auth", authRoute);
app.use("/api/members", memberRoute);
app.use("/api/plans", planRoute);
app.use("/api/admin", adminRoute);
app.use("/api/director", directorRoute);
app.use("/api/members/subscription", subscriptionRoute);
app.use("/api/members/group-subscription", groupRoute);
app.use("/api/paystack", paystackRoute);
app.use("/api/workflow", workflowRoute);
app.use("/api/station", stationRoute);
app.use("/api/checkinout", checkInOutRoute);

app.use(errorHandler);

setupCronJobs();

export const io = setupSocket(ioServer);

connectDatabase();

// cancelPaystackSubscription("SUB_75ujr3y1vodaorf");

server.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(`Server running on port ${process.env.PORT}`);
});
// seedDatabase();
