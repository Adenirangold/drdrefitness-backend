import cron from "node-cron";
import Member from "../models/member";

// Function to update subscription statuses
const updateSubscriptionStatus = async () => {
  try {
    const now = new Date();
    // Update expired subscriptions
    await Member.updateMany(
      { "currentSubscription.endDate": { $lt: now } },
      { $set: { "currentSubscription.subscriptionStatus": "expired" } }
    );
    // Update active subscriptions
    await Member.updateMany(
      { "currentSubscription.endDate": { $gte: now } },
      { $set: { "currentSubscription.subscriptionStatus": "active" } }
    );
    console.log(
      "Subscription statuses updated successfully at",
      new Date().toLocaleString()
    );
  } catch (error) {
    console.error("Error updating subscription statuses:", error);
  }
};

// Schedule the job to run daily at midnight (WAT, UTC+1)
cron.schedule("0 0 12 24 6 *", updateSubscriptionStatus, {
  timezone: "Africa/Lagos", // Set to WAT
});

// module.exports = { updateSubscriptionStatus };
