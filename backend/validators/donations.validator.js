import Joi from "joi";

export const createOrderSchema = Joi.object({
  campaign: Joi.string().required(),
  amount: Joi.number().min(1).required(),
  paymentMethod: Joi.string().valid(
    "card",
    "upi",
    "netbanking",
    "wallet",
    "other"
  ),
  isAnonymous: Joi.boolean(),
  message: Joi.string().max(500).allow(""),
});

export const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});
