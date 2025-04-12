import axios from 'axios';

console.log('API Service Initializing...');

// Hard-coded URL with standard protocol and no port
const DEFAULT_API_URL = 'https://67.205.172.213/api';
console.log('Default API URL set to:', DEFAULT_API_URL);

// Get runtime config
const runtimeConfig = (window as any).REACT_APP_RUNTIME_CONFIG;
console.log('Runtime config:', runtimeConfig);

// Always use the default URL
const API_URL = DEFAULT_API_URL;
console.log('FINAL API URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  withCredentials: false
});

// Log all requests
api.interceptors.request.use(
  (config) => {
    // Force base URL regardless of what's set
    config.baseURL = DEFAULT_API_URL;
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Force HTTPS protocol
    if (config.url && config.url.startsWith('http://')) {
      config.url = config.url.replace('http://', 'https://');
    }
    
    // Remove port 8086 if present
    if (config.url && config.url.includes(':8086')) {
      config.url = config.url.replace(':8086', '');
    }
    
    // Create complete URL for logging
    const fullUrl = (config.baseURL || '') + (config.url || '');
    console.log('Making API request to:', fullUrl);
    console.log('Request method:', config.method);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle errors in responses
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.message === 'Network Error' || !error.response) {
      console.error('Network error detected. Please check your connection.');
      console.error('Error details:', error);
    } else {
      console.error(`API error (${error.response?.status || 'unknown'}):`, error.message);
    }
    return Promise.reject(error);
  }
);

// Direct request creator
const createDirectRequest = (method: string, endpoint: string, data?: any) => {
  const fullUrl = `https://67.205.172.213/api${endpoint}`;
  console.log(`Creating direct ${method} request to:`, fullUrl);
  
  return axios({
    method: method,
    url: fullUrl,
    data: data,
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {})
    }
  }).then(response => {
    console.log(`Response from ${endpoint}:`, response.status);
    if (endpoint === '/user-devices') {
      console.log('USER DEVICES RESPONSE DATA:', response.data);
      console.log('Number of devices:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('First device:', response.data[0]);
      }
    }
    return response;
  }).catch(error => {
    console.error(`Error from ${endpoint}:`, error.message);
    console.error('Error details:', error.response?.data || error);
    throw error;
  });
};

// User API endpoints
export const userApi = {
  signup: (userData: { username: string; email: string; password: string }) => 
    createDirectRequest('post', '/signup', userData),
  
  login: (credentials: { email: string; password: string }) => 
    createDirectRequest('post', '/login', credentials),
  
  forgotPassword: (email: { email: string }) => 
    createDirectRequest('post', '/forgot-password', email),
  
  resetPassword: (resetData: { email: string; otp: string; new_password: string }) => 
    createDirectRequest('post', '/reset-password', resetData),
};

// Device API endpoints
export const deviceApi = {
  registerDevice: (deviceData: { device_type?: string; serial_number: string }) => 
    createDirectRequest('post', '/register-device', deviceData),
  
  getDevices: () => 
    createDirectRequest('get', '/user-devices'),
  
  getDeviceLogs: (serialNumber: string) => {
    // Add timestamp to prevent caching and ensure we get the latest data
    const timestamp = new Date().getTime();
    console.log('Fetching device logs with serial:', serialNumber, 'at:', new Date().toLocaleString());
    return createDirectRequest('get', `/get-device-logs?serial_number=${serialNumber}&_t=${timestamp}`);
  },
  
  analyzeDeviceData: (serialNumber: string, timeFrame?: string) => 
    createDirectRequest('get', `/analyze-device?serial_number=${serialNumber}${timeFrame ? `&timeFrame=${timeFrame}` : ''}`),
  
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
  }) => createDirectRequest('post', '/log-device-data', deviceData),
  
  getUnclaimedDevices: () => 
    createDirectRequest('get', '/unclaimed-devices'),
    
  claimDevice: (deviceData: { serial_number: string }) => 
    createDirectRequest('post', '/claim-device', deviceData)
};

// Notification API endpoints
export const notificationApi = {
  getNotifications: (unreadOnly?: boolean) => 
    createDirectRequest('get', `/notifications${unreadOnly ? '?unread=true' : ''}`),
  
  createNotification: (notification: { 
    type: string; 
    message: string; 
    device_id?: number;
    device_name?: string;
  }) => createDirectRequest('post', '/notifications', notification),
  
  markAsRead: (notificationId: number) => 
    createDirectRequest('put', `/notifications/read?id=${notificationId}`),
  
  markAllAsRead: () => 
    createDirectRequest('put', '/notifications/read-all'),
  
  deleteNotification: (notificationId: number) => 
    createDirectRequest('delete', `/notifications?id=${notificationId}`),
  
  generateDeviceNotifications: () => 
    createDirectRequest('post', '/notifications/generate', {})
};

export default api; 