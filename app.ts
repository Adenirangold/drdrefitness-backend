import dotenv from "dotenv";
import express from "express";

import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/members", memberRoute);

connectDatabase();
app.listen(process.env.PORT);
