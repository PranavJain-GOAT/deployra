const Razorpay = require('razorpay');
const crypto = require('crypto');
const { prisma } = require('../config/database');

// Initialize Razorpay conditionally based on env vars
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
        const { orderId, paymentId, signature, productId } = req.body;

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
            let purchase = null;

            if (productId) {
                const product = await prisma.product.findUnique({ where: { id: productId } });
                if (product) {
                    purchase = await prisma.purchase.create({
                      data: {
                        userId: req.user.id,
                        productId,
                        pricePaid: product.price,
                        status: 'COMPLETED'
                      }
                    });

                    // 1. Create linked Order
                    await prisma.order.create({
                      data: {
                        userId: req.user.id,
                        productId,
                        details: `Razorpay Purchase of "${product.title}" for $${product.price}`
                      }
                    });

                    // 2. Create Notifications
                    await prisma.notification.create({
                      data: {
                        userId: product.developerId,
                        type: 'SALE_RECEIVED',
                        title: 'New Product Sale!',
                        message: `Your product "${product.title}" was purchased by ${req.user.name || req.user.email} for $${product.price}.`
                      }
                    });

                    await prisma.notification.create({
                      data: {
                        userId: req.user.id,
                        type: 'PURCHASE_CONFIRMED',
                        title: 'Purchase Confirmed',
                        message: `Thank you for purchasing "${product.title}". You can now access/download it from your dashboard.`
                      }
                    });

                    // 3. Create Activities
                    await prisma.activity.create({
                      data: {
                        userId: product.developerId,
                        type: 'ORDER_RECEIVED',
                        title: 'New Order Received',
                        body: `Your product "${product.title}" has been purchased by ${req.user.name || req.user.email} for $${product.price}.`,
                        meta: JSON.stringify({ productId, purchaseId: purchase.id })
                      }
                    });

                    await prisma.activity.create({
                      data: {
                        userId: req.user.id,
                        type: 'PRODUCT_PURCHASED',
                        title: 'Product Purchased',
                        body: `You successfully purchased "${product.title}" for $${product.price}.`,
                        meta: JSON.stringify({ productId, purchaseId: purchase.id })
                      }
                    });
                }
            }

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                paymentId,
                data: purchase
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
