import cron from "node-cron";
import Member from "../models/member";

// Function to update subscription statuses
const updateSubscriptionStatus = async () => {
  try {
    const now = new Date();
    // Update expired subscriptions
    const expiredResult = await Member.updateMany(
      {
        "currentSubscription.endDate": { $lt: now },
        "currentSubscription.subscriptionStatus": { $ne: "expired" },
      },
      { $set: { "currentSubscription.subscriptionStatus": "expired" } }
    );
    // Update active subscriptions
    const activeResult = await Member.updateMany(
      {
        "currentSubscription.endDate": { $gte: now },
        "currentSubscription.subscriptionStatus": { $ne: "active" },
      },
      { $set: { "currentSubscription.subscriptionStatus": "active" } }
    );
    console.log(
      `Subscription statuses updated at ${new Date().toLocaleString("en-US", {
        timeZone: "Africa/Lagos",
      })}`
    );
    console.log(
      `Expired: ${expiredResult.modifiedCount}, Active: ${activeResult.modifiedCount}`
    );
  } catch (error) {
    console.error("Error updating subscription statuses:", error);
  }
};

export function setupCronJobs() {
  cron.schedule("0 0 * * *", updateSubscriptionStatus, {
    timezone: "Africa/Lagos", // WAT
  });
}
