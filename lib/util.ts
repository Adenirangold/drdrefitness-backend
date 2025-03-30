import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Response } from "express";
import { Types } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { AuthResponse, TokenPayload, UserInput } from "../types";

dotenv.config();

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Failed to compare passwords: ${(error as Error).message}`);
  }
};

export const getJWTToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) {
    throw new Error("JWT_SECRET must be defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: Number(expiresIn),
    algorithm: "HS256",
  };

  try {
    return jwt.sign(
      payload as TokenPayload,
      Buffer.from(secret, "utf-8"),
      options
    );
  } catch (error) {
    throw new Error(
      `Failed to generate JWT token: ${(error as Error).message}`
    );
  }
};

export const sendAuthResponse = (
  res: Response,
  userId: Types.ObjectId,
  email: string
): void => {
  try {
    const token = getJWTToken({ id: userId.toString() });

    const authResponse: AuthResponse = {
      id: userId.toString(),
      email,
      token,
    };
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      status: "success",
      message: "Authentication successful",
      data: authResponse,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to generate authentication token",
    });
  }
};

export const verifyToken = (token: string): TokenPayload | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be defined in environment variables");
  }

  try {
    return jwt.verify(token, Buffer.from(secret, "utf-8")) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const createHashedToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedtoken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { hashedtoken, resetToken };
};

export const calculateEndDate = (startDate: Date, durationInDays: number) => {
  const start = new Date(startDate);

  start.setDate(start.getDate() + durationInDays);

  return start.toISOString();
};

export const formatDate = (dateString: Date) => {
  const date = new Date(dateString);

  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, ",");
};
