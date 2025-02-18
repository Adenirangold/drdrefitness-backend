import axios from "axios";

const paystack = axios.create({
  baseURL: process.env.PAYSTACK_URL!,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
    "Content-Type": "application/json",
  },
});

export default paystack;
