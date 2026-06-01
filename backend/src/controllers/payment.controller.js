const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay conditionally based on env vars
// In a real production app, this would throw an error if missing, but we'll allow initialization 
// to fail gracefully if the user hasn't set keys yet.
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

exports.createOrder = async (req, res, next) => {
    try {
        const { amount, currency = "USD" } = req.body;
        
        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        const razorpay = getRazorpayInstance();
        
        if (!razorpay) {
            return res.status(500).json({ 
                success: false, 
                message: "Razorpay keys not configured on server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." 
            });
        }

        // Setting up options for razorpay order.
        const options = {
            amount: Math.round(amount * 100), // convert to smallest currency unit
            currency: currency,
            receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            payment_capture: 1 // auto capture
        };

        const response = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (err) {
        console.error("Razorpay Create Order Error:", err);
        res.status(500).json({ success: false, message: 'Not able to create order. Please try again!' });
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ success: false, message: "Missing required payment parameters." });
        }

        const secret_key = process.env.RAZORPAY_KEY_SECRET;
        
        if (!secret_key) {
             return res.status(500).json({ success: false, message: "Razorpay secret key not configured on server." });
        }

        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', secret_key)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === signature;

        if (isAuthentic) {
            // Payment is successful and verified
            // Here you would typically update your database with the paymentId and status
            console.log('Payment request is legitimate:', { orderId, paymentId });
            
            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                paymentId
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
    } catch (err) {
        console.error("Razorpay Verify Payment Error:", err);
        res.status(500).json({ success: false, message: 'Server error during verification.' });
    }
};
