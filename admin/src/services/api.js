import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const uploadAPI = axios.create({
  baseURL: API_BASE_URL,
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
  uploadProfilePicture: (formData) => {
    const token = localStorage.getItem('token');
    return uploadAPI.post('/auth/profile-picture', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// Hotel APIs
export const hotelAPI = {
  getAll: () => api.get('/hotels'),
  getById: (id) => api.get(`/hotels/${id}`),
  getSimilar: (id) => api.get(`/hotels/${id}/similar`),
  create: (data) => uploadAPI.post('/hotels', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => {
    const token = localStorage.getItem('token');
    return uploadAPI.put(`/hotels/${id}`, data, { 
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  // Note: let axios auto-set Content-Type for FormData
  delete: (id) => api.delete(`/hotels/${id}`),
};

// Event APIs
export const eventAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => uploadAPI.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => {
    const token = localStorage.getItem('token');
    return uploadAPI.put(`/events/${id}`, data, { 
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  delete: (id) => api.delete(`/events/${id}`),
  book: (id, data) => api.post(`/events/${id}/book`, data),
};

// Tourism APIs
export const tourismAPI = {
  getAll: () => api.get('/tourism'),
  getById: (id) => api.get(`/tourism/${id}`),
  create: (data) => uploadAPI.post('/tourism', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => {
    const token = localStorage.getItem('token');
    return uploadAPI.put(`/tourism/${id}`, data, { 
      headers: { Authorization: `Bearer ${token}` }
    });
  },
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

