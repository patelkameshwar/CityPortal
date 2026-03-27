import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadProfilePicture: (formData) => api.post('/auth/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Hotel APIs
export const hotelAPI = {
  getAll: () => api.get('/hotels'),
  getById: (id) => api.get(`/hotels/${id}`),
  getSimilar: (id) => api.get(`/hotels/${id}/similar`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
};

// Event APIs
export const eventAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  getSimilar: (id) => api.get(`/events/${id}/similar`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  book: (id, data) => api.post(`/events/${id}/book`, data),
};

// Tourism APIs
export const tourismAPI = {
  getAll: () => api.get('/tourism'),
  getById: (id) => api.get(`/tourism/${id}`),
  getSimilar: (id) => api.get(`/tourism/${id}/similar`),
  create: (data) => api.post('/tourism', data),
  update: (id, data) => api.put(`/tourism/${id}`, data),
  delete: (id) => api.delete(`/tourism/${id}`),
  book: (id, data) => api.post(`/tourism/${id}/book`, data),
};


// Blog APIs
export const blogAPI = {
  getAll: () => api.get('/blogs'),
  getById: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

// Booking APIs
export const bookingAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  getClientBookings: () => api.get('/bookings/client'),
  getAdminBookings: () => api.get('/bookings/admin'),
  cancel: (id) => api.put(`/bookings/cancel/${id}`),
  create: (data) => api.post('/bookings', data),
};

export default api;
