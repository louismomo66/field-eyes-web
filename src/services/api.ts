import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://67.205.172.213:8086/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API endpoints
export const userApi = {
  signup: (userData: { username: string; email: string; password: string }) => 
    api.post('/signup', userData),
  
  login: (credentials: { email: string; password: string }) => 
    api.post('/login', credentials),
  
  forgotPassword: (email: { email: string }) => 
    api.post('/forgot-password', email),
  
  resetPassword: (resetData: { email: string; otp: string; new_password: string }) => 
    api.post('/reset-password', resetData),
};

// Device API endpoints
export const deviceApi = {
  registerDevice: (deviceData: { device_type?: string; serial_number: string }) => 
    api.post('/devices', deviceData),
  
  getDevices: () => 
    api.get('/devices'),
  
  getDeviceLogs: (serialNumber: string) => 
    api.get(`/data/${serialNumber}`),
  
  analyzeDeviceData: (serialNumber: string, timeFrame?: string) => 
    api.get(`/analytics/${serialNumber}${timeFrame ? `?timeFrame=${timeFrame}` : ''}`),
  
  logDeviceData: (deviceData: { 
    serial_number: string; 
    temperature?: number;
    humidity?: number;
    nitrogen?: number;
    phosphorous?: number;
    potassium?: number;
    ph?: number;
    soil_moisture?: number;
    soil_temperature?: number;
    soil_humidity?: number;
    longitude?: number;
    latitude?: number;
  }) => api.post('/data', deviceData)
};

// Notification API endpoints
export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) => 
    api.get(`/notifications${unreadOnly ? '?unread=true' : ''}`),
  
  createNotification: (notification: { 
    type: string; 
    message: string; 
    device_id?: number;
    device_name?: string;
  }) => api.post('/notifications', notification),
  
  markAsRead: (notificationId: number) => 
    api.put(`/notifications/read?id=${notificationId}`),
  
  markAllAsRead: () => 
    api.put('/notifications/read-all'),
  
  deleteNotification: (notificationId: number) => 
    api.delete(`/notifications?id=${notificationId}`),
  
  generateDeviceNotifications: () => 
    api.post('/notifications/generate')
};

export default api; 