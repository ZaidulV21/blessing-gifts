import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

// Load environment variables (ensure keys are available even if imported early)
dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paise (1 INR = 100 paise)
 * @param {string} orderId - Unique order ID from DB
 * @param {string} customerEmail - Customer email
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<Object>} Razorpay order response
 */
export async function createRazorpayOrder(
  amount,
  orderId,
  customerEmail,
  customerPhone
) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: orderId,
      notes: {
        orderId,
        email: customerEmail,
        phone: customerPhone,
      },
    });
    return { success: true, data: order };
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create Razorpay order",
    };
  }
}

/**
 * Verify Razorpay payment signature
 * Professional e-commerce practice: Always verify signature server-side
 * @param {string} razorpayOrderId - Razorpay order ID
 * @param {string} razorpayPaymentId - Razorpay payment ID
 * @param {string} razorpaySignature - Razorpay signature from frontend
 * @returns {boolean} Whether signature is valid
 */
export function verifyRazorpaySignature(
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) {
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export async function fetchRazorpayPayment(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Failed to fetch payment:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Capture payment (for authorized payments)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount in paise
 * @returns {Promise<Object>} Capture response
 */
export async function captureRazorpayPayment(paymentId, amount) {
  try {
    const captured = await razorpay.payments.capture(
      paymentId,
      Math.round(amount * 100)
    );
    return { success: true, data: captured };
  } catch (error) {
    console.error("Payment capture failed:", error);
    return { success: false, error: error.message };
  }
}

export default razorpay;
