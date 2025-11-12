# Book Marketplace Frontend

React-based frontend for the Book & Assignment Marketplace application.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Stripe** - Payment processing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe

Update the Stripe publishable key in `src/pages/cart/Cart.jsx`:

```javascript
const stripePromise = loadStripe('your_stripe_publishable_key_here');
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/           # Navbar, Footer
│   │   └── routing/          # PrivateRoute
│   ├── pages/
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── auth/             # Login, Register
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout success
│   │   ├── orders/           # Order history
│   │   ├── products/         # Product listing & details
│   │   ├── profile/          # User profile
│   │   └── seller/           # Seller dashboard
│   ├── store/
│   │   ├── slices/           # Redux slices
│   │   └── store.js          # Redux store config
│   ├── utils/
│   │   └── api.js            # API client
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features

### Customer Features
- Browse and search products
- View product details and reviews
- Add to cart and checkout
- Download purchased files
- Write product reviews
- View order history

### Seller Features
- Create and manage products
- Upload files and preview images
- View sales statistics
- Manage seller profile
- Track earnings

### Admin Features
- Manage users and sellers
- Approve/reject products
- View platform statistics
- Monitor transactions

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`.

All API calls are defined in `src/utils/api.js` and include:
- Authentication
- Products
- Orders
- Reviews
- Categories
- Admin operations

## State Management

Redux Toolkit is used for global state management with the following slices:

- **authSlice** - User authentication and profile
- **productSlice** - Products and listings
- **cartSlice** - Shopping cart with localStorage persistence

## Styling

Tailwind CSS is used for styling with custom utility classes defined in `index.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.input-field` - Input field style
- `.card` - Card container style
