import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updateSellerProfile: (data) => API.put('/auth/seller-profile', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  getMyProducts: () => API.get('/products/seller/my-products'),
  download: (id) => API.get(`/products/${id}/download`, { responseType: 'blob' }),
};

// Order APIs
export const orderAPI = {
  createCheckoutSession: (data) => API.post('/orders/create-checkout-session', data),
  getMyOrders: () => API.get('/orders/my'),
};

// Review APIs
export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getProductReviews: (productId) => API.get(`/reviews/product/${productId}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => API.get('/admin/users'),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getProducts: (params) => API.get('/admin/products', { params }),
  reviewProduct: (id, data) => API.put(`/admin/products/${id}/review`, data),
  getStats: () => API.get('/admin/stats'),
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist'),
  addToWishlist: (productId) => API.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => API.delete(`/wishlist/${productId}`),
  clearWishlist: () => API.delete('/wishlist'),
  checkWishlist: (productId) => API.get(`/wishlist/check/${productId}`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => API.get('/notifications', { params }),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.put(`/notifications/${id}/mark-read`),
  markAllAsRead: () => API.put('/notifications/mark-all-read'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};

export default API;
