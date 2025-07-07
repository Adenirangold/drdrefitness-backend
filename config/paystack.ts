import axios from "axios";
import AppError from "../utils/AppError";
import { MetaData } from "../types";
import Plan from "../models/plan";
import exp from "constants";

const paystack = axios.create({
  baseURL: process.env.PAYSTACK_URL!,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
    "Content-Type": "application/json",
  },
});

export const paystackInitializePayment = async (
  email: string,
  amount: number,
  metadata: MetaData
) => {
  try {
    const response = await paystack.post("/transaction/initialize", {
      email,
      amount: amount * 100,
      callback_url: `${process.env.FRONTEND_URL}/verify-payment`,
      metadata,
    });

    return response;
  } catch (err) {
    throw new AppError("Payment initialization failed", 500);
  }
};
export const paystackVerifyPayment = async (reference: string) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const {
      status,
      gateway_response,
      amount,
      customer,
      metadata,
      transaction_date,
      authorization,
    } = response.data.data;
    return {
      status,
      gateway_response,
      amount,
      customer,
      metadata,
      transaction_date,
      payment_type: authorization.channel,
      authorization_code: authorization.authorization_code,
      lastCardDigits: authorization.last4,
      exp_month: authorization.exp_month,
      exp_year: authorization.exp_year,
      cardType: authorization.card_type,
    };
  } catch (err) {
    throw new AppError("Payment initialization failed", 500);
  }
};

export const createPaystackPlan = async (
  name: string,
  price: number,
  interval: string
) => {
  try {
    const response = await paystack.post("/plan", {
      name,
      amount: price * 100, // In kobo
      interval,
    });

    // console.log(response);

    return response;
  } catch (err) {
    throw new AppError("Failed to create Paystack plan", 500);
  }
};
export const updatePaystackPlan = async ({
  paystackPlanCode,
  name,
  price,
  interval,
}: {
  paystackPlanCode: string;
  name: string;
  price: number;
  interval: string;
}) => {
  try {
    const response = await paystack.put(`/plan/${paystackPlanCode}`, {
      name,
      amount: price * 100, // In kobo
      interval,
    });

    // console.log(response);

    return response;
  } catch (err) {
    throw new AppError("Failed to update plan in Paystack plan", 500);
  }
};

export async function updateExistingPlans() {
  try {
    const plans = await Plan.find({ paystackPlanCode: { $exists: false } });

    for (const plan of plans) {
      let interval = "monthly";
      if (plan.name === "3-months") {
        interval = "quarterly";
      } else if (plan.name === "6-months") {
        interval = "biannually";
      } else if (plan.name === "1-year") {
        interval = "annually";
      }

      if (plan.name === "2-months") {
        console.log(
          `Skipping plan ${plan.name} as it is not supported by Paystack`
        );
        return;
      }

      const planName = `${plan.gymLocation}-${plan.gymBranch}-${plan.planType}-${plan.name}`;

      const paystackResponse = await createPaystackPlan(
        planName,
        plan.price,
        interval
      );

      await Plan.updateOne(
        { _id: plan._id },
        {
          $set: {
            paystackPlanCode: paystackResponse.data.data.plan_code,
          },
        }
      );
      console.log(
        `Updated plan ${planName} with plan_code: ${paystackResponse.data.data.plan_code}`
      );
    }

    console.log("All plans updated successfully");
  } catch (error) {
    console.error("Error updating plans:", error);
  }
}

export const chargeAuthorisation = async ({
  email,
  amount,
  authorizationCode,
}: {
  email: string;
  amount: number;
  authorizationCode: string;
}) => {
  try {
    const response = await paystack.put(`/transaction/charge_authorization`, {
      email,
      amount: amount * 100,
      authorization_code: authorizationCode,
    });

    // console.log(response);

    return response;
  } catch (err) {
    throw new AppError("Failed to create Paystack plan", 500);
  }
};

export const createSubscription = async ({
  email,
  planCode,
  authorizationCode,
}: {
  email: string;
  planCode: string;
  authorizationCode: string;
}) => {
  try {
    const response = await paystack.post(`/subscription`, {
      customer: email,
      plan: planCode,
      authorization: authorizationCode,
    });

    return response;
  } catch (err) {
    throw new AppError("Failed to create subscription", 500);
  }
};

export const cancelPaystackSubscription = async ({
  subscriptionCode,
  emailToken,
}: {
  subscriptionCode: string;
  emailToken: string;
}) => {
  try {
    const response = await paystack.post(`/subscription/disable`, {
      code: subscriptionCode,
      token: emailToken,
    });

    // console.log(response);

    return response;
  } catch (err) {
    console.log(err);

    throw new AppError("Failed to cancel Paystack subscription", 500);
  }
};
