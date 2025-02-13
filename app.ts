import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";
import planRoute from "./routes/planRoute";
import authRoute from "./routes/authRoute";
import workflowRoute from "./routes/workflowRoute";
import { configureSecurityMiddleware } from "./middleware/security";
import errorHandler from "./middleware/errorHandler";

dotenv.config();
const app = express();
configureSecurityMiddleware(app);

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/members", memberRoute);
app.use("/api/plans", planRoute);
app.use("/api/workflow", workflowRoute);

app.use(errorHandler);

connectDatabase();
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
