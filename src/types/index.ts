// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

// Device types
export interface Device {
  id: number;
  device_type: string;
  serial_number: string;
  name: string;
  location: string;
  status: string;
  battery: number;
  signal: number;
  last_reading: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceData {
  id: number;
  device_id: number;
  serial_number: string;
  temperature: number;
  humidity: number;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  ph: number;
  soil_moisture: number;
  soil_temperature: number;
  soil_humidity: number;
  longitude: number;
  latitude: number;
  created_at: string;
}

// Analysis types
export interface AnalysisResult {
  device_id: number;
  serial_number: string;
  analysis_type: string;
  recommendations: string[];
  predictions: Record<string, number>;
  trends: Record<string, string>;
  last_updated: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DeviceResponse {
  message: string;
  device_id?: string;
  serial_number: string;
} 