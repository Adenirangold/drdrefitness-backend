import rateLimit from "express-rate-limit";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from "express";
import slowDown from "express-slow-down";
import cors from "cors";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits: number) => hits * 100,
});

const configureSecurityMiddleware = (app: express.Application) => {
  app.use(cors());
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://yourdomain.com"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.use(helmet());

  app.set("trust proxy", 1);

  app.use(rateLimiter);

  app.use(speedLimiter);
};

export { configureSecurityMiddleware };
