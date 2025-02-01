import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDatabase from "./config/database";
import memberRoute from "./routes/memberRoute";

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

app.use("/api/members", memberRoute);

// connectDatabase();
app.listen(process.env.PORT, () => {
  console.log("====================================");
  console.log(`Server running on port ${process.env.PORT}`);
  console.log("====================================");
});
