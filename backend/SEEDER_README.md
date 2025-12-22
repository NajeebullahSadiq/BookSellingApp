# Database Seeder Instructions

This script will populate your MongoDB database with sample data for the BookSellingApp.

## Prerequisites

Ensure you have the following:

1. Node.js installed
2. MongoDB running (either locally or remote)
3. A `.env` file in the backend directory with your MongoDB connection string

## Environment Setup

Make sure you have a `.env` file with the MongoDB connection string:

```
MONGO_URI=mongodb://localhost:27017/booksellingapp
```

Replace the URI with your actual MongoDB connection string.

## Running the Seeder

To run the seeder script, follow these steps:

1. Navigate to the backend directory:
```
cd /path/to/BookSellingApp/backend
```

2. Install dependencies if you haven't already:
```
npm install
```

3. Run the seeder script:
```
node seeder.js
```

4. You should see console output indicating the creation of users, categories, products, orders, and reviews.

## Sample Users

The seeder creates the following users:

1. **Customer Account**
   - Email: john@example.com
   - Password: password123
   - Role: customer

2. **Seller Account**
   - Email: jane@example.com
   - Password: password123
   - Role: seller
   - Store: Jane's Academic Hub

3. **Admin Account**
   - Email: admin@bookseller.com
   - Password: admin123
   - Role: admin

4. **Additional Seller Account**
   - Email: robert@example.com
   - Password: password123
   - Role: seller
   - Store: Rob's Math Resources

5. **Additional Customer Account**
   - Email: sarah@example.com
   - Password: password123
   - Role: customer

## Warning

This script will clear all existing data in the following collections:
- Users
- Categories
- Products
- Orders
- Reviews

Only run this script in a development environment or when you want to reset your database with fresh sample data.
