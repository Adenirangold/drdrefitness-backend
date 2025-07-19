import cron from "node-cron";
import mongoose from "mongoose";
import axios from "axios";
import Member from "../models/member";
import { calculateEndDate } from "../lib/util";
import { chargeAuthorisation } from "../config/paystack";

const chargeRecurringPayments = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Calculate 2 days after today for retry window
    const endOfRetryWindow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2,
      23,
      59,
      59,
      999
    );

    const members = await Member.find({
      "currentSubscription.endDate": {
        $gte: startOfToday,
        $lte: endOfRetryWindow,
      },

      "currentSubscription.authorizationCode": { $exists: true },
    })
      .populate("currentSubscription.plan")
      .session(session);

    for (const member of members) {
      const plan = member.currentSubscription?.plan as any;
      if (plan.name !== "2-months") {
        continue;
      }

      const response = await chargeAuthorisation({
        email: member.email!,
        amount: plan.price,
        authorizationCode: member.currentSubscription?.authorizationCode!,
      });

      if (response.data.status && response.data.data.status === "success") {
        await Member.updateOne(
          { _id: member._id },
          {
            $set: {
              "currentSubscription.transactionReference":
                response.data.data.reference,
              "currentSubscription.paymentStatus": "approved",
              "currentSubscription.startDate": new Date(),
              "currentSubscription.endDate": new Date(
                calculateEndDate(new Date(), plan.duration)
              ),
            },
          },
          { session }
        );
        console.log(
          `Processed ${members.length} members at ${new Date().toLocaleString(
            "en-US",
            {
              timeZone: "Africa/Lagos",
            }
          )}`
        );
        if (response.data.status && response.data.data.status === "success") {
          console.log(
            `Successfully charged member ${member._id} for plan ${plan.name}`
          );
        } else {
          console.error(
            `Failed to charge member ${member._id}:`,
            response.data
          );
        }
      } else {
        await Member.updateOne(
          { _id: member._id },
          {
            $set: {
              "currentSubscription.paymentStatus": "declined",
              "currentSubscription.subscriptionStatus": "expired",
            },
          },
          { session }
        );
      }
    }

    console.log(
      `Recurring payments charged at ${new Date().toLocaleString("en-US", {
        timeZone: "Africa/Lagos",
      })}`
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error("Error charging recurring payments:", error);
  } finally {
    session.endSession();
    console.log(
      "Cron job completed at",
      new Date().toLocaleString("en-US", {
        timeZone: "Africa/Lagos",
      })
    );
  }
};

// Run every day at midnight

export function setupCronJobsPayment() {
  cron.schedule("0 0 * * *", chargeRecurringPayments, {
    timezone: "Africa/Lagos", // WAT
  });
}
