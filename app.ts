import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";
import planRoute from "./routes/planRoute";
import authRoute from "./routes/authRoute";
import subscriptionRoute from "./routes/subscriptionRoute";
import adminRoute from "./routes/adminRoute";
import paystackRoute from "./routes/paystackRoute";
import workflowRoute from "./routes/workflowRoute";
import { configureSecurityMiddleware } from "./middleware/security";
import errorHandler from "./middleware/errorHandler";
import bodyParser from "body-parser";
import { sendWelcomeEmail } from "./config/email";

dotenv.config();
const app = express();
configureSecurityMiddleware(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/auth", authRoute);
app.use("/api/members", memberRoute);
app.use("/api/plans", planRoute);
app.use("/api/admin", adminRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/paystack", paystackRoute);
app.use("/api/workflow", workflowRoute);

app.use(errorHandler);

connectDatabase();
app.listen(process.env.PORT, async () => {
  // await sendWelcomeEmail("adeniranbayogold@gmail.com", `Adeniran Gold`);

  // console.log(`Server running on port ${process.env.PORT}`);
  console.log(`Server running on port ${process.env.PORT}`);
});
