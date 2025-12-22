# Book & Assignment Marketplace MVP

A full-stack web application that enables students and professionals to buy and sell books, study materials, and assignments online.

## 🌟 Features

### For Customers
- Browse and search books, notes, and assignments
- Add items to cart and purchase securely
- Download purchased digital content
- Rate and review items
- View order history

### For Sellers
- Create seller profile
- Upload books and assignments with files
- Manage product listings (edit, delete)
- View sales and earnings
- Track transaction history

### For Admins
- Manage all users and listings
- Approve/reject product submissions
- Monitor transactions and reports
- Manage categories and content
- View platform analytics

## 🏗️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Redux Toolkit** - State management
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Stripe** - Payment processing

## 📁 Project Structure

```
BookSellingApp/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   ├── utils/        # Helper functions
│   │   └── config/       # Configuration
│   ├── uploads/          # File storage
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   └── utils/        # Utilities
│   └── package.json
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd BookSellingApp
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookmarket
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start frontend:
```bash
npm start
```

Visit `http://localhost:3000`

## 📊 User Roles & Permissions

| Feature | Customer | Seller | Admin |
|---------|----------|--------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Purchase Items | ✅ | ✅ | ✅ |
| Upload Products | ❌ | ✅ | ✅ |
| Manage Own Products | ❌ | ✅ | ✅ |
| Approve Listings | ❌ | ❌ | ✅ |
| Manage All Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | Own Only | All |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Secure file upload validation
- CORS protection
- XSS protection with Helmet

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/payment` - Process payment

### Reviews
- `POST /api/products/:id/reviews` - Add review
- `GET /api/products/:id/reviews` - Get product reviews

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/products/:id/approve` - Approve product
- `GET /api/admin/stats` - Get platform statistics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Deploy from Git repository
3. Configure MongoDB Atlas connection

### Frontend (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `build` folder
3. Set environment variables

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Support

For issues or questions, please create an issue in the repository or contact the development team.