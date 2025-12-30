import axios from 'axios';

export const API_BASE_URL =  'https://mericent.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  signup: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getCurrentUser: () => api.get('/auth/singleUser'),

  googleLogin: () => window.location.href = `${API_BASE_URL}/auth/google`,
};

// Product APIs
export const productAPI = {
  getProducts: (params?: object) => api.get('/api/product', { params }),

  getProductById: (id: string) => api.get(`/api/product/${id}`),

  createProduct: (data: object) =>
    api.post('/api/productPost', data),

  updateProduct: (id: string, data: object) => api.put(`/api/product/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/api/product/${id}`),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/api/cart'),

  addToCart: (data: { productId: string; quantity: number }) =>
    api.post('/api/cart/add', data),

  updateCartItem: (itemId: string, data: { quantity: number }) =>
    api.put(`/api/cart/item/${itemId}`, data),

  removeFromCart: (itemId: string) =>
    api.delete(`/api/cart/item/${itemId}`),

  clearCart: () => api.delete('/api/cart'),

  checkout: (data: { shippingAddress: string; paymentMethod: string }) =>
    api.post('/api/cart/checkout', data),
};

// Order APIs
export const orderAPI = {
  getOrders: () => api.get('/api/orders'),

  getOrderById: (id: string) => api.get(`/api/orders/${id}`),

  getAllOrders: () => api.get('/api/orders/all'),

  updateOrderStatus: (id: string, data: { status: string }) =>
    api.put(`/api/orders/${id}/status`, data),

  cancelOrder: (id: string) => api.post(`/api/orders/${id}/cancel`),

  // Create order: supports guest order (no auth) or authenticated order
  createOrder: (data: object) => api.post('/api/orders', data),

  // Attach guest orders to authenticated user (server uses cookie or body.guestId)
  attachGuestOrders: (data?: { guestId?: string }) => api.post('/api/orders/attach-guest', data || {}),
};

export default api;