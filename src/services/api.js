import axios from 'axios';

// Base configuration
const API_BASE_URL = 'http://localhost:8080/api/users';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - Add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CRITICAL: let browser set multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});


// RESPONSE INTERCEPTOR - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, userId, role } = response.data;
    
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  },

  getCurrentUser: () => ({
    userId: localStorage.getItem('userId'),
    role: localStorage.getItem('role'),
    token: localStorage.getItem('token'),
  }),

  isAuthenticated: () => !!localStorage.getItem('token'),
};

// ==================== BOOKING SERVICE ====================
export const bookingService = {
  getAllBookings: () => api.get('/bookings'),
  getUserUpcomingBookings: () => api.post('/bookings/user/upcoming'),
  getUserPastBookings: () => api.get('/bookings/user/past'),
  createBooking: (bookingData) => api.get('/bookings/create', { params: bookingData }),
  confirmBooking: (bookingId) => api.post(`/bookings/confirm`, { bookingId }),
  completeBooking: (bookingId) => api.put(`/bookings/complete`, { bookingId }),
  cancelBooking: (bookingId) => api.put(`/bookings/cancel`, { bookingId }),
  getPractitionerCalendar: (practitionerId) => api.get(`/bookings/practitioner/calendar`, { params: { practitionerId } }),
};

// ==================== PRACTITIONER SERVICE ====================
export const practitionerService = {
  create: (profileData) => api.post('/practitioners', profileData),
  update: (profileData) => api.put('/practitioners/update', profileData),
  uploadCertificate: (file) => {
    const formData = new FormData();
    formData.append("certificate", file);

    return api.post("/practitioners/certificate", formData);
  },
  verify: (practitionerId) => api.get('/practitioners/verify', { params: { practitionerId } }),
  getVerified: () => api.get('/practitioners/verified'),
  getBySpecialization: (specialization) => api.get('/practitioners/verified/specialization', { 
    params: { specialization } 
  }),
  addAvailability: (availabilityData) => api.get('/practitioners/availability/add', { 
    params: availabilityData 
  }),
  getAvailableSlots: (practitionerId, date) => api.get('/practitioners/availability/slots', {
    params: { practitionerId, date }
  }),
};

// ==================== PRODUCT SERVICE ====================
export const productService = {
  getAll: () => api.get('/products'),
  create: (productData) => api.post('/products/create', productData),
  update: (productId, productData) => api.put('/products/update', { ...productData, productId }),
  delete: (productId) => api.put('/products/delete', { productId }),
};

// ==================== CART SERVICE ====================
export const cartService = {
  addToCart: (productId, quantity) => api.get('/cart/add', { params: { productId, quantity } }),
  getCurrentCart: () => api.get('/cart/current'),
  updateQuantity: (cartItemId, quantity) => api.put('/cart/update', { cartItemId, quantity }),
  removeItem: (cartItemId) => api.delete('/cart/remove', { params: { cartItemId } }),
  clearCart: () => api.delete('/cart/clear'),
};

// ==================== ORDER SERVICE ====================
export const orderService = {
  checkout: (orderData) => api.post('/orders/checkout', orderData),
  getMyOrders: () => api.get('/orders/my'),
  updateStatus: (orderId, status) => api.put('/orders/status', { orderId, status }),
};

// ==================== REVIEW SERVICE ====================
export const reviewService = {
  addProductReview: (productId, rating, comment) => 
    api.post('/reviews/product/add', { productId, rating, comment }),
  getProductReviews: (productId) => 
    api.get('/reviews/product', { params: { productId } }),
  addPractitionerReview: (practitionerId, rating, comment) =>
    api.post('/reviews/practitioner/add', { practitionerId, rating, comment }),
  getPractitionerReviews: (practitionerId) =>
    api.get('/reviews/practitioner', { params: { practitionerId } }),
};

// ==================== COMMUNITY Q&A SERVICE ====================
export const qaService = {
  postQuestion: (content) => api.post('/qa/question/post', { content }),
  getAllQuestions: () => api.get('/qa/questions'),
  postAnswer: (questionId, content) => api.post('/qa/answer/post', { questionId, content }),
  getQuestionAnswers: (questionId) => api.get('/qa/question/answers', { params: { questionId } }),
};

// ==================== RECOMMENDATION SERVICE ====================
export const recommendationService = {
  generate: (symptom) => api.post('/recommendations/generate', { symptom }),
  getMyRecommendations: () => api.get('/recommendations/my'),
};

// ==================== NOTIFICATION SERVICE ====================
export const notificationService = {
  getAll: () => api.get('/notifications'),
};

// ==================== ADMIN PRACTITIONER SERVICE ====================
export const adminPractitionerService = {
  getPending: () => api.get('../admin/practitioners/pending'),
  verify: (id) => api.put(`../admin/practitioners/${id}/verify`),
  reject: (id) => api.put(`../admin/practitioners/${id}/reject`)
};


export default api;