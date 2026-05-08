# Razorpay Payment Integration Setup Guide

## Overview
This guide explains the professional Razorpay payment integration added to the Blessing Gifts e-commerce platform. The integration includes:

- **Backend Payment Order Creation**: Create Razorpay orders with order verification
- **Payment Signature Verification**: Secure server-side verification to prevent fraud
- **Database Integration**: Save payment details (Razorpay Order ID, Payment ID, Signature) to MongoDB
- **Error Handling**: Comprehensive error handling and logging
- **Payment Status Tracking**: Track payment status (pending, completed, failed)

## Step 1: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in to your account
3. Navigate to **Settings → API Keys**
4. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
5. Copy your **Key Secret** (keep this secret - never expose in frontend)

### Key Types:
- **Test Mode**: For development and testing (with test payments)
- **Live Mode**: For production (with real payments)

## Step 2: Configure Environment Variables

### Backend Setup (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_uri_here

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

⚠️ **Important**: 
- Never commit `.env` file to GitHub
- Use `.env.example` for documentation
- Keep `RAZORPAY_KEY_SECRET` secret - it's only used on the backend
- Frontend only gets `RAZORPAY_KEY_ID` which is public

### Frontend Setup (if needed)
The frontend receives the `RAZORPAY_KEY_ID` from the backend `/api/orders/payment/create` endpoint.

## Step 3: Install Dependencies

### Backend
```bash
cd server
npm install razorpay
# Or if using yarn:
yarn add razorpay
```

The `razorpay` package is already added to `server/package.json`.

### Frontend
No additional npm packages needed. The Razorpay checkout script is loaded dynamically from the CDN.

## Step 4: How the Payment Flow Works

### 1. **Checkout Page**: User fills details and selects "Online Payment"
   - User enters: Name, Phone, Address, Email
   - Selects "Online Payment" (Razorpay) option

### 2. **Frontend**: User clicks "Proceed to Payment"
   - Validates form data
   - Creates order object with customer & item details

### 3. **Backend**: `/api/orders/payment/create` endpoint
   - Creates order in MongoDB with `paymentStatus: "pending"`
   - Creates Razorpay order via API
   - Stores Razorpay Order ID in database
   - Returns order details + Razorpay Order ID to frontend

### 4. **Razorpay Checkout Modal**: User enters payment details
   - Modal displays with customer details pre-filled
   - User selects payment method (Card, UPI, Wallet, etc.)
   - Razorpay handles payment processing securely

### 5. **Payment Success Handler**: After successful payment
   - Frontend receives: `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
   - Frontend calls backend verification endpoint

### 6. **Backend Verification**: `/api/orders/payment/verify`
   - **CRITICAL**: Verifies payment signature using crypto
   - Fetch payment details from Razorpay API
   - Updates order: `paymentStatus: "completed"` and `status: "Confirmed"`
   - Stores payment details in MongoDB
   - Returns confirmation to frontend

### 7. **Success Navigation**
   - Order is confirmed
   - Cart is cleared
   - User redirected to `/order-success` page

## Professional E-Commerce Features

### 🔒 Security
- **Signature Verification**: Server-side verification prevents fraudulent payments
- **Idempotency**: Payment processing is idempotent (re-running verification doesn't create duplicate charges)
- **Secret Key Protection**: `RAZORPAY_KEY_SECRET` never exposed to frontend

### 💾 Data Storage
- **Order Model**: Stores payment fields:
  - `razorpayOrderId`: Razorpay Order ID
  - `razorpayPaymentId`: Payment transaction ID
  - `razorpaySignature`: Payment signature (for audit trail)
  - `paymentStatus`: "pending", "completed", or "failed"
  - `payment`: Payment method used

### 🚨 Error Handling
- Payment creation failures → Delete order from DB
- Signature verification failure → Log and reject payment
- Payment cancellation → Record in database
- Network errors → Graceful error messages

### 📊 Tracking
- Track payment status independently from order status
- Admin can see payment details in order logs
- Can retry failed payments or manual reconciliation

## Step 5: Testing the Integration

### Test Cards (in Test Mode)
Use these test cards to verify the payment flow:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date (MM/YY)
- CVV: Any 3 digits

**Payment Failure:**
- Card: 4444 3333 2222 1111
- Expiry: Any future date
- CVV: Any 3 digits

### Test UPI IDs
- Success: `success@razorpay`
- Failure: `failed@razorpay`

### Testing Steps
1. Run backend: `npm run dev` (in server folder)
2. Run frontend: `npm start` (in root folder)
3. Go to Checkout page
4. Select "Online Payment"
5. Fill form and click "Proceed to Payment"
6. Use test card from above
7. Verify payment success/failure handling

## Step 6: Database Fields

### Order Schema Updates
```javascript
paymentStatus: {
  type: String,
  enum: ["pending", "completed", "failed"],
  default: "pending"
},
razorpayOrderId: { type: String, index: true },
razorpayPaymentId: { type: String },
razorpaySignature: { type: String },
```

### Queries
Find orders by Razorpay Order ID:
```javascript
Order.findOne({ razorpayOrderId: "order_xxx" })
```

Find pending payments:
```javascript
Order.find({ paymentStatus: "pending" })
```

## Step 7: Going to Production

### Before Going Live:
1. ✅ Switch Razorpay from Test Mode to Live Mode
2. ✅ Update `.env` with Live Mode Keys:
   - `RAZORPAY_KEY_ID=rzp_live_xxxxx`
   - `RAZORPAY_KEY_SECRET=live_secret_xxxxx`
3. ✅ Test with test transactions in Live Mode (Razorpay provides test payment limits)
4. ✅ Update favicon in public/index.html (recommended)
5. ✅ Update Razorpay image in Checkout.jsx to your actual logo

### Production Checklist:
- [ ] SSL/HTTPS enabled on backend
- [ ] API rate limiting configured
- [ ] Error logs monitored
- [ ] Customer support notified about payment changes
- [ ] Backup payment method configured
- [ ] Refund policy documented

## API Endpoints

### Create Payment Order
```
POST /api/orders/payment/create
Content-Type: application/json

{
  "customerName": "Raj Sharma",
  "phone": "9876543210",
  "email": "raj@email.com",
  "address": "123 Main St, Lucknow, UP 226001",
  "items": [
    {
      "productId": "prod_1",
      "name": "Gift Set A",
      "qty": 2,
      "price": 500,
      "imageUrl": "...",
      "category": "Gift Sets"
    }
  ],
  "totalAmount": 1060,
  "payment": "Razorpay",
  "note": "Gift for Mom"
}

Response:
{
  "order": { order object },
  "razorpay": {
    "orderId": "order_xxx",
    "keyId": "rzp_test_xxx",
    "amount": 106000,
    "currency": "INR"
  }
}
```

### Verify Payment
```
POST /api/orders/payment/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx",
  "orderId": "BG-xxxxxx"
}

Response:
{
  "message": "Payment verified successfully",
  "order": { order object },
  "paymentStatus": "completed"
}
```

### Handle Payment Failure
```
POST /api/orders/payment/failed
Content-Type: application/json

{
  "orderId": "BG-xxxxxx",
  "razorpayOrderId": "order_xxx",
  "reason": "User cancelled"
}
```

## Troubleshooting

### Issue: "Script loading failed"
- **Solution**: Check browser console for errors. Razorpay CDN might be blocked.
- **Workaround**: Add Razorpay script to index.html directly

### Issue: "Invalid signature"
- **Solution**: Ensure `RAZORPAY_KEY_SECRET` is correct in `.env`
- Check: Payment data matches exactly with signature

### Issue: Payment not saving to database
- **Solution**: Verify MongoDB connection
- Check: `MONGO_URI` in `.env` is correct

### Issue: "Cannot read property 'Razorpay'"
- **Solution**: Script not loaded. Check network tab in DevTools
- Ensure CDN script loads before checkout modal opens

## Support & Documentation

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Card Details**: https://razorpay.com/docs/payments/payments-gateway/test-card-details/
- **Razorpay API Reference**: https://razorpay.com/docs/api/

## Code Files Modified

1. **Backend**:
   - `server/package.json` - Added razorpay dependency
   - `server/models/Order.js` - Added payment fields
   - `server/utils/razorpayUtils.js` - New file with Razorpay utilities
   - `server/controllers/orderController.js` - Added payment endpoints
   - `server/routes/orderRoutes.js` - Added payment routes
   - `server/.env` - Added Razorpay keys

2. **Frontend**:
   - `src/services/api.js` - Added payment API functions
   - `src/pages/Checkout.jsx` - Integrated Razorpay payment modal
   - `public/index.html` - Razorpay script loaded dynamically

## Next Steps

1. Get Razorpay API keys from dashboard
2. Add keys to `.env` file
3. Run: `cd server && npm install` to install razorpay package
4. Test the payment flow with test cards
5. Deploy to production with live keys

---

**Created**: May 8, 2026
**Integration Type**: Professional E-Commerce Payment Gateway
**Payment Methods**: Credit Cards, Debit Cards, UPI, Digital Wallets, Netbanking
