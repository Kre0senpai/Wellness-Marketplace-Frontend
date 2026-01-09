import axios from 'axios';

 const API_BASE_URL = 'http://localhost:8080/api/users';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem('token', res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH ================= */
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, userId, role } = res.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    return res.data;
  },
  register: (data) => api.post('/auth/register', data),
  logout: async () => {
    await api.post('/auth/logout', {
      refreshToken: localStorage.getItem('refreshToken'),
    });
    localStorage.clear();
    window.location.href = '/login';
  },
  getCurrentUser: () => ({
    userId: localStorage.getItem('userId'),
    role: localStorage.getItem('role'),
  }),
  isAuthenticated: () => !!localStorage.getItem('token'),
};

/* ================= USER ================= */
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
};

/* ================= BOOKINGS ================= */
export const bookingService = {
  getAllBookings: () => api.get('/bookings'),
  getUserUpcomingBookings: () => api.get('/bookings/user/upcoming'),
  getUserPastBookings: () => api.get('/bookings/user/past'),
  createBooking: (data) => api.post('/bookings/create', data),
};

/* ================= PRACTITIONER ================= */
export const practitionerService = {
  create: (data) => api.post('/practitioners/create', data),
  update: (data) => api.put('/practitioners/update', data),
  getVerified: () => api.get('/practitioners/verified'),
  getBySpecialization: (specialization) =>
    api.get('/practitioners/verified/specialization', { params: { specialization } }),
  getAvailableSlots: (practitionerId, date) =>
    api.get('/practitioners/availability/slots', { params: { practitionerId, date } }),
};

/* ================= PRODUCTS ================= */
export const productService = {
  getAll: () => api.get('/products'),
};

/* ================= CART ================= */
export const cartService = {
  addToCart: (productId, quantity) =>
    api.post('/cart/add', { productId, quantity }),
  getCurrentCart: () => api.get('/cart/current'),
};

/* ================= ORDERS ================= */
export const orderService = {
  getMyOrders: () => api.get('/orders/my'),
};

/* ================= REVIEWS ================= */
export const reviewService = {
  getPractitionerReviews: (practitionerId) =>
    api.get('/reviews/practitioner', { params: { practitionerId } }),
};

/* ================= Q&A ================= */
export const qaService = {
  getAllQuestions: () => api.get('/qa/questions'),
  postQuestion: (content) => api.post('/qa/question/post', { content }),
  getQuestionAnswers: (questionId) =>
    api.get('/qa/question/answers', { params: { questionId } }),
};

/* ================= RECOMMENDATIONS ================= */
export const recommendationService = {
  generate: (symptom) => api.post('/recommendations/generate', { symptom }),
  getMyRecommendations: () => api.get('/recommendations/my'),
};

/* ================= NOTIFICATIONS ================= */
export const notificationService = {
  getAll: () => api.get('/notifications'),
};

export default api;
