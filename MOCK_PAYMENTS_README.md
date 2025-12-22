# Testing BookSellingApp Without Stripe API Keys

This guide explains how to test the application's checkout flow without requiring real Stripe API keys.

## Mock Payment Mode

The application has been modified to include a "mock payment" mode that bypasses actual Stripe API calls. When this mode is enabled, the checkout process will:

1. Skip actual Stripe API calls
2. Automatically mark orders as "completed"
3. Redirect users directly to the success page

## How It Works

When a user attempts to check out:

1. The frontend sends the checkout request to the backend
2. The backend detects that mock payments are enabled
3. Instead of calling Stripe, it creates a completed order and returns a success response
4. The frontend redirects directly to the success page

## Configuration

### Backend Configuration

The mock payment mode is controlled by the `USE_MOCK_PAYMENTS` environment variable in the backend `.env` file:

```
# Mock payment mode - set to true to bypass actual Stripe API calls
USE_MOCK_PAYMENTS=true
```

### Frontend Configuration

The frontend has been updated to handle mock payment responses. No special configuration is needed other than ensuring the `.env` file has:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_mockkey
```

## Testing the Checkout Flow

To test the checkout flow:

1. Add products to your cart
2. Click the "Proceed to Checkout" button
3. The system will bypass Stripe and redirect you directly to the success page
4. Your order will be marked as "completed" automatically

## Switching Back to Real Payments

When you're ready to use real Stripe payments:

1. Update the backend `.env` file:
   ```
   USE_MOCK_PAYMENTS=false
   STRIPE_SECRET_KEY=your_real_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_real_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_real_webhook_secret
   ```

2. Update the frontend `.env` file:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=your_real_stripe_publishable_key
   ```

3. Restart both the backend and frontend servers

## Notes

- In mock mode, all orders are automatically marked as "completed"
- Seller statistics (sales count, earnings) are updated just like with real payments
- The webhook endpoint is also mocked and will return success responses
