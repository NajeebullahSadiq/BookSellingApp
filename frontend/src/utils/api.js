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
  trackView: (id) => API.post(`/products/${id}/track-view`),
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

// Seller Analytics APIs
export const sellerAPI = {
  getStats: () => API.get('/seller/stats'),
  getRevenueTrends: (params) => API.get('/seller/revenue-trends', { params }),
  getTopProducts: (params) => API.get('/seller/top-products', { params }),
  getRecentSales: (params) => API.get('/seller/recent-sales', { params }),
};

// Message APIs
export const messageAPI = {
  getConversations: (params) => API.get('/messages/conversations', { params }),
  getConversation: (id) => API.get(`/messages/conversations/${id}`),
  getMessages: (conversationId, params) => API.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data) => API.post('/messages/send', data),
  markAsRead: (conversationId) => API.put(`/messages/conversations/${conversationId}/mark-read`),
  deleteConversation: (id) => API.delete(`/messages/conversations/${id}`),
  getUnreadCount: () => API.get('/messages/unread-count'),
};

export const downloadHistoryAPI = {
  getMy: (params) => API.get('/download-history/my', { params }),
};

// Report APIs
export const reportAPI = {
  create: (data) => API.post('/reports', data),
  getAll: (params) => API.get('/reports', { params }),
  getById: (id) => API.get(`/reports/${id}`),
  updateStatus: (id, data) => API.put(`/reports/${id}`, data),
  delete: (id) => API.delete(`/reports/${id}`),
  getMyReports: () => API.get('/reports/my-reports'),
  getStats: () => API.get('/reports/stats'),
};

// Recommendation APIs
export const recommendationAPI = {
  getPersonalized: (params) => API.get('/recommendations/personalized', { params }),
  getForYou: (params) => API.get('/recommendations/for-you', { params }),
  getSimilar: (productId, params) => API.get(`/recommendations/similar/${productId}`, { params }),
  getTrending: (params) => API.get('/recommendations/trending', { params }),
  getPopular: (params) => API.get('/recommendations/popular', { params }),
};

// Blog APIs
export const blogAPI = {
  getAll: (params) => API.get('/blogs', { params }),
  getBySlug: (slug) => API.get(`/blogs/slug/${slug}`),
  getById: (id) => API.get(`/blogs/${id}`),
  getRelated: (id) => API.get(`/blogs/${id}/related`),
  create: (data) => API.post('/blogs', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => API.put(`/blogs/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/blogs/${id}`),
};

export default API;
