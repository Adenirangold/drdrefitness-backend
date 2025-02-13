import { NextFunction, Request, Response } from "express";
import { serve } from "@upstash/workflow/express";

export const setRemider = serve(async (context: any) => {
  const res1 = await context.run("step1", async () => {
    const message = context.requestPayload.message;
    return message;
  });

  await context.run("step2", async () => {
    console.log(res1);
  });
});
