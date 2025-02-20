import axios from "axios";
import AppError from "../utils/AppError";
import { MetaData } from "../types";

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
    };
  } catch (err) {
    throw new AppError("Payment initialization failed", 500);
  }
};
