import { Client as WorkflowClient } from "@upstash/workflow";

const workflowClient = new WorkflowClient({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
});
