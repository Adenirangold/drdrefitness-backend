import z from "zod";
import { memberSchema } from "../utils/schema";

declare global {
  type UserInput = z.infer<typeof memberSchema>;
}

export {};
