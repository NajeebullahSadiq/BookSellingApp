# Book Marketplace Backend

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Then update the values in `.env`:
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string
- `STRIPE_SECRET_KEY`: Your Stripe secret key (test mode)
- Email credentials for notifications
- Other configuration values

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas (cloud).

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/seller-profile` - Update seller profile (Seller only)

### Products
- `GET /api/products` - Get all approved products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller only)
- `PUT /api/products/:id` - Update product (Seller only)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)
- `GET /api/products/:id/download` - Download product file (Purchased users)
- `GET /api/products/seller/my-products` - Get seller's products (Seller only)

### Orders
- `POST /api/orders/create-checkout-session` - Create Stripe checkout session
- `POST /api/orders/webhook` - Stripe webhook endpoint
- `GET /api/orders/my` - Get user's orders

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id` - Update user (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)
- `GET /api/admin/products` - Get all products including pending (Admin only)
- `PUT /api/admin/products/:id/review` - Approve/reject product (Admin only)
- `GET /api/admin/stats` - Get dashboard statistics (Admin only)

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/           # Route controllers
├── middleware/           # Auth, upload, etc.
├── models/               # Mongoose models
├── routes/               # API routes
├── uploads/              # File storage
│   ├── products/
│   ├── images/
│   └── profiles/
├── utils/                # Helper functions
├── .env                  # Environment variables
├── .env.example          # Example environment file
├── package.json
└── server.js             # Entry point
```

## Testing

Test the API health check:
```bash
curl http://localhost:5000/api/health
```
