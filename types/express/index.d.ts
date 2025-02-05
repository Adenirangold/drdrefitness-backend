import { UserInput } from "..";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserInput;
  }
}
