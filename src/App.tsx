import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { LanguageProvider } from './utils/LanguageContext';
import { SettingsProvider } from './utils/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Map from './pages/Map';
import Settings from './pages/Settings';
import RegisterDevice from './pages/RegisterDevice';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/home" />} />
      <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to="/home" />} />
      <Route path="/forgot-password" element={!isLoggedIn ? <ForgotPassword /> : <Navigate to="/home" />} />
      <Route path="/reset-password" element={!isLoggedIn ? <ResetPassword /> : <Navigate to="/home" />} />
      
      {/* Protected routes with AppLayout */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Home />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Map />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/register-device" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <RegisterDevice />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Default route */}
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
