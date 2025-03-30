import z from "zod";
import { memberSchema } from "../utils/schema";

export type UserInput = z.infer<typeof memberSchema>;
export type SubscriptionData = UserInput["currentSubscription"];

export interface AuthResponse {
  id: string;
  email: string;
  token?: string;
}
export interface TokenPayload {
  id: string;
  email: string;
}
export type Role = z.infer<typeof memberSchema>["role"];

declare module "express-serve-static-core" {
  interface Request {
    user?: RequestUser;
  }
}

export interface MetaData {
  firstName: string;
  lastName: string;
  phoneNumber: number;
}
export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface GroupSupscriptionEmail {
  inviterName: string;
  inviteeEmail: string;
  planName: string;
  planEndDate: string;
  planLocation: string;
  planBranch: string;
  inviteLink: string;
}
