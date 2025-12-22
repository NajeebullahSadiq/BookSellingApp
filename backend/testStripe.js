require('dotenv').config();
const Stripe = require('stripe');

async function testStripeConnection() {
  try {
    console.log('Testing Stripe connection with key:', process.env.STRIPE_SECRET_KEY);
    
    // Initialize Stripe with the API key
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Try to make a simple API call to verify the key works
    const customers = await stripe.customers.list({ limit: 1 });
    
    console.log('✅ Stripe connection successful!');
    console.log('Retrieved customer count:', customers.data.length);
    console.log('Your Stripe API key is valid.');
  } catch (error) {
    console.error('❌ Stripe connection failed!');
    console.error('Error message:', error.message);
    console.error('Please check your Stripe API key and make sure it is correct.');
  }
}

testStripeConnection();
