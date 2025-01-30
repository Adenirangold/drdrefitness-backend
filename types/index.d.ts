import z from "zod";
import { userSchema } from "../utils/schema";

declare global {
  type UserInput = z.infer<typeof userSchema>;
}

export {};
