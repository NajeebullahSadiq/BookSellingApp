import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import CheckoutSuccess from './pages/checkout/CheckoutSuccess';
import Profile from './pages/profile/Profile';
import MyOrders from './pages/orders/MyOrders';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateProduct from './pages/seller/CreateProduct';
import MyProducts from './pages/seller/MyProducts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />

          {/* Seller Routes */}
          <Route path="/seller/dashboard" element={<PrivateRoute role="seller"><SellerDashboard /></PrivateRoute>} />
          <Route path="/seller/create-product" element={<PrivateRoute role="seller"><CreateProduct /></PrivateRoute>} />
          <Route path="/seller/products" element={<PrivateRoute role="seller"><MyProducts /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><ManageUsers /></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute role="admin"><ManageProducts /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
