/**
 * Razorpay payment integration utility
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './config';

/**
 * Initialize Razorpay instance
 */
export function getRazorpayInstance() {
    if (!config.payment.razorpay.keyId || !config.payment.razorpay.keySecret) {
        throw new Error('Razorpay credentials not configured');
    }

    return new Razorpay({
        key_id: config.payment.razorpay.keyId,
        key_secret: config.payment.razorpay.keySecret,
    });
}

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Receipt ID for reference
 * @param {object} notes - Additional notes/metadata
 * @returns {Promise<object>} Razorpay order object
 */
export async function createRazorpayOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
        const razorpay = getRazorpayInstance();

        const orderOptions = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt,
            notes,
            payment_capture: 1, // Auto capture payment
        };

        const order = await razorpay.orders.create(orderOptions);
        return {
            success: true,
            order,
        };
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
    try {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', config.payment.razorpay.keySecret)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Verify webhook signature
 * @param {string} webhookBody - Raw webhook body
 * @param {string} webhookSignature - Webhook signature from header
 * @param {string} webhookSecret - Webhook secret configured in Razorpay dashboard
 * @returns {boolean} True if webhook signature is valid
 */
export function verifyWebhookSignature(webhookBody, webhookSignature, webhookSecret) {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(webhookBody)
            .digest('hex');

        return expectedSignature === webhookSignature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
export async function fetchPaymentDetails(paymentId) {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(paymentId);

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error('Fetch payment details error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Capture payment (if not auto-captured)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture in smallest currency unit
 * @param {string} currency - Currency code
 * @returns {Promise<object>} Captured payment details
 */
export async function capturePayment(paymentId, amount, currency = 'INR') {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.capture(
            paymentId,
            Math.round(amount * 100),
            currency
        );

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error('Payment capture error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Initiate refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Refund details
 */
export async function initiateRefund(paymentId, amount = null, notes = {}) {
    try {
        const razorpay = getRazorpayInstance();
        const refundOptions = { notes };

        if (amount) {
            refundOptions.amount = Math.round(amount * 100);
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        return {
            success: true,
            refund,
        };
    } catch (error) {
        console.error('Refund initiation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Fetch refund details
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<object>} Refund details
 */
export async function fetchRefundDetails(refundId) {
    try {
        const razorpay = getRazorpayInstance();
        const refund = await razorpay.refunds.fetch(refundId);

        return {
            success: true,
            refund,
        };
    } catch (error) {
        console.error('Fetch refund details error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Generate payment receipt number
 * @param {string} userId - User ID
 * @returns {string} Receipt number
 */
export function generateReceiptNumber(userId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCPT_${userId}_${timestamp}_${random}`;
}

/**
 * Convert amount to Razorpay format (paise)
 * @param {number} amount - Amount in rupees
 * @returns {number} Amount in paise
 */
export function toRazorpayAmount(amount) {
    return Math.round(amount * 100);
}

/**
 * Convert amount from Razorpay format (paise to rupees)
 * @param {number} amount - Amount in paise
 * @returns {number} Amount in rupees
 */
export function fromRazorpayAmount(amount) {
    return amount / 100;
}
