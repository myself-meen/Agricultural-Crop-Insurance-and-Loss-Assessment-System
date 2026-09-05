import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pmfby_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard error extraction & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if we're attempting to login
      if (!error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('pmfby_token');
        localStorage.removeItem('pmfby_user');
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.details ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const userApi = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const farmerProfileApi = {
  getProfile: (userId) => api.get(`/farmer/profile/${userId}`),
  saveProfile: (userId, data) => api.post(`/farmer/profile/${userId}`, data),
};

export const policyApi = {
  enrollPolicy: (farmerId, data) => api.post(`/policies/enroll/${farmerId}`, data),
  getPoliciesByFarmer: (farmerId) => api.get(`/policies/farmer/${farmerId}`),
  getAllPolicies: () => api.get('/policies'),
  updatePolicyStatus: (id, status) => api.put(`/policies/${id}/status?status=${status}`),
};

export const lossNotificationApi = {
  reportLoss: (policyId, data) => api.post(`/loss-notifications/report/${policyId}`, data),
  getLossByPolicy: (policyId) => api.get(`/loss-notifications/policy/${policyId}`),
  getLossByFarmer: (farmerId) => api.get(`/loss-notifications/farmer/${farmerId}`),
  getAllLosses: () => api.get('/loss-notifications'),
};

export const surveyApi = {
  assignSurveyor: (notificationId, surveyorId, data) =>
    api.post(`/surveys/assign/${notificationId}?surveyorId=${surveyorId}`, data),
  submitSurvey: (id, data) => api.put(`/surveys/${id}/submit`, data),
  getSurveysBySurveyor: (surveyorId) => api.get(`/surveys/surveyor/${surveyorId}`),
  getAllSurveys: () => api.get('/surveys'),
};

export const claimApi = {
  initiateClaim: (surveyId) => api.post(`/claims/initiate/${surveyId}`),
  approveL1: (id, officerId, remarks) =>
    api.put(`/claims/${id}/l1-approve?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  approveL2: (id, officerId, remarks) =>
    api.put(`/claims/${id}/l2-approve?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  rejectClaim: (id, officerId, remarks) =>
    api.put(`/claims/${id}/reject?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  disburseDbt: (id) => api.post(`/claims/${id}/disburse-dbt`),
  getAllClaims: () => api.get('/claims'),
  getClaimById: (id) => api.get(`/claims/${id}`),
};

export const analyticsApi = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};

export const auditApi = {
  getAuditLogs: () => api.get('/audit-logs'),
};

export default api;
