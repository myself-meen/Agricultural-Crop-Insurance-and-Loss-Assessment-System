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
  login: (credentials) => {
    const id = credentials.identifier || credentials.email || credentials.userId || credentials.username;
    return api.post('/auth/login', {
      identifier: id,
      email: id,
      password: credentials.password,
    });
  },
  register: (userData) => api.post('/auth/register', userData),
};

export const userApi = {
  getAllUsers: () => api.get('/users'),
  getAll: () => api.get('/users'),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const farmerProfileApi = {
  getProfile: (userId) => api.get(`/farmer-profiles/user/${userId}`),
  saveProfile: (userId, data) => api.post(`/farmer-profiles/user/${userId}`, data),
  deleteProfile: (userId) => api.delete(`/farmer-profiles/user/${userId}`),
  getAllProfiles: () => api.get('/farmer-profiles'),
  getAll: () => api.get('/farmer-profiles'),
};

export const policyApi = {
  enrollPolicy: (farmerId, data) => api.post(`/policies/enroll/farmer/${farmerId}`, data),
  getPoliciesByFarmer: (farmerId) => api.get(`/policies/farmer/${farmerId}`),
  getAllPolicies: () => api.get('/policies'),
  getAll: () => api.get('/policies'),
  updatePolicyStatus: (id, status) => api.put(`/policies/${id}/status?status=${status}`),
  deletePolicy: (id) => api.delete(`/policies/${id}`),
};

export const lossNotificationApi = {
  reportLoss: (policyId, data) => api.post(`/loss-notifications/policy/${policyId}`, data),
  getLossByPolicy: (policyId) => api.get(`/loss-notifications/policy/${policyId}`),
  getLossByFarmer: (farmerId) => api.get(`/loss-notifications/farmer/${farmerId}`),
  getAllLosses: () => api.get('/loss-notifications'),
  getAll: () => api.get('/loss-notifications'),
  deleteLoss: (id) => api.delete(`/loss-notifications/${id}`),
};

export const surveyApi = {
  assignSurveyor: (notificationId, surveyorId, data) =>
    api.post(`/survey-assignments/assign?notificationId=${notificationId}&surveyorId=${surveyorId}`, data || {}),
  updateStatus: (id, status) => api.put(`/survey-assignments/${id}/status?status=${status}`),
  submitSurvey: (id, data) => api.put(`/survey-assignments/${id}/submit`, data),
  submit: (id, data) => api.put(`/survey-assignments/${id}/submit`, data),
  getSurveysBySurveyor: (surveyorId) => api.get(`/survey-assignments/surveyor/${surveyorId}`),
  getSurveysByStatus: (status) => api.get(`/survey-assignments/status/${status}`),
  getAllSurveys: () => api.get('/survey-assignments'),
  getAll: () => api.get('/survey-assignments'),
  deleteSurvey: (id) => api.delete(`/survey-assignments/${id}`),
};

export const claimApi = {
  initiateClaim: (surveyId) => api.post(`/claims/initiate?surveyId=${surveyId}`),
  approveL1: (id, officerId, remarks) =>
    api.put(`/claims/${id}/approve-l1?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  approveL2: (id, officerId, remarks) =>
    api.put(`/claims/${id}/approve-l2?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  updateStatus: (id, status, remarks) => {
    const officerId = 3;
    if (status === 'APPROVED' || status === 'Approved') {
      return api.put(`/claims/${id}/approve-l2?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`);
    }
    return api.put(`/claims/${id}/reject?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`);
  },
  rejectClaim: (id, officerId, remarks) =>
    api.put(`/claims/${id}/reject?officerId=${officerId}&remarks=${encodeURIComponent(remarks || '')}`),
  disburseDbt: (id) => api.put(`/claims/${id}/disburse`),
  disburse: (id) => api.put(`/claims/${id}/disburse`),
  getAllClaims: () => api.get('/claims'),
  getAll: () => api.get('/claims'),
  getClaimsByFarmer: (farmerId) => api.get(`/claims/farmer/${farmerId}`),
  getClaimById: (id) => api.get(`/claims/${id}`),
  deleteClaim: (id) => api.delete(`/claims/${id}`),
};

export const analyticsApi = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
  getKpis: () => api.get('/analytics/dashboard'),
};

export const auditApi = {
  getAuditLogs: () => api.get('/audit-logs'),
  getAll: () => api.get('/audit-logs'),
};

export default api;

