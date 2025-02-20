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

export const getJWTToken = (id: string): string => {
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
      { id } as TokenPayload,
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
    const token = getJWTToken(userId.toString());

    const authResponse: AuthResponse = {
      data: {
        id: userId.toString(),
        email,
      },
      token,
    };

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

// {
//   "status": true,
//   "message": "Verification successful",
//   "data": {
//     "id": 4099260516,
//     "domain": "test",
//     "status": "success",
//     "reference": "re4lyvq3s3",
//     "receipt_number": null,
//     "amount": 40333,
//     "message": null,
//     "gateway_response": "Successful",
//     "paid_at": "2024-08-22T09:15:02.000Z",
//     "created_at": "2024-08-22T09:14:24.000Z",
//     "channel": "card",
//     "currency": "NGN",
//     "ip_address": "197.210.54.33",
//     "metadata": "",
//     "log": {
//       "start_time": 1724318098,
//       "time_spent": 4,
//       "attempts": 1,
//       "errors": 0,
//       "success": true,
//       "mobile": false,
//       "input": [],
//       "history": [
//         {
//           "type": "action",
//           "message": "Attempted to pay with card",
//           "time": 3
//         },
//         {
//           "type": "success",
//           "message": "Successfully paid with card",
//           "time": 4
//         }
//       ]
//     },
//     "fees": 10283,
//     "fees_split": null,
//     "authorization": {
//       "authorization_code": "AUTH_uh8bcl3zbn",
//       "bin": "408408",
//       "last4": "4081",
//       "exp_month": "12",
//       "exp_year": "2030",
//       "channel": "card",
//       "card_type": "visa ",
//       "bank": "TEST BANK",
//       "country_code": "NG",
//       "brand": "visa",
//       "reusable": true,
//       "signature": "SIG_yEXu7dLBeqG0kU7g95Ke",
//       "account_name": null
//     },
//     "customer": {
//       "id": 181873746,
//       "first_name": null,
//       "last_name": null,
//       "email": "demo@test.com",
//       "customer_code": "CUS_1rkzaqsv4rrhqo6",
//       "phone": null,
//       "metadata": null,
//       "risk_action": "default",
//       "international_format_phone": null
//     },
//     "plan": null,
//     "split": {},
//     "order_id": null,
//     "paidAt": "2024-08-22T09:15:02.000Z",
//     "createdAt": "2024-08-22T09:14:24.000Z",
//     "requested_amount": 30050,
//     "pos_transaction_data": null,
//     "source": null,
//     "fees_breakdown": null,
//     "connect": null,
//     "transaction_date": "2024-08-22T09:14:24.000Z",
//     "plan_object": {},
//     "subaccount": {}
//   }
// }
