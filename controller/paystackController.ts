import paystack from "../config/paystack";
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const initializePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, amount, metadata, phone, lastName, firstName } = req.body;
    const extendedMetadata = { ...metadata, phone, lastName, firstName };

    if (!email || !amount) {
      next(new AppError("Email and amount are required", 400));
    }

    // Initialize transaction
    const response = await paystack.post("/transaction/initialize", {
      email,

      amount: amount,
      callback_url: `${
        req.body.callback_url || process.env.FRONTEND_URL + "/payment-callback"
      }`,
      metadata: extendedMetadata,
    });

    if (!response) {
      return next(new AppError("Payment initialization failed", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Payment initialized",
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        accessCode: response.data.data.access_code,
      },
    });
  } catch (error) {
    next(new AppError("Payment initialization failed", 500));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reference } = req.params;

  if (!reference) {
    return next(new AppError("No reference supplied", 400));
  }

  try {
    // Verify the transaction
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const { status, gateway_response, amount, customer, metadata } =
      response.data.data;

    // Return transaction details to client
    res.json({
      success: true,
      data: {
        status,
        message: gateway_response,
        amount: amount / 100,
        customer,
        metadata,
        transaction_date: response.data.data.transaction_date,
        reference,
      },
    });
  } catch (error) {
    next(new AppError("Payment initialization failed", 500));
  }
};
