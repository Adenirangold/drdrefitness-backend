import z from "zod";
import { memberSchema } from "../utils/schema";

export type UserInput = z.infer<typeof memberSchema>;
export type SubscriptionData = UserInput["currentSubscription"];
