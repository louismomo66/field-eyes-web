import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for user settings
export interface UserProfile {
  username: string;
  email: string;
  phone: string;
  bio: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  deviceAlerts: boolean;
  weeklyReports: boolean;
  marketingUpdates: boolean;
  emailAddress: string;
  phoneNumber: string;
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationPreferences;
}

// Define context type
interface SettingsContextType {
  userSettings: UserSettings;
  updateProfile: (profile: UserProfile) => void;
  updateNotifications: (notifications: NotificationPreferences) => void;
  resetSettings: () => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: UserSettings = {
  profile: {
    username: '',
    email: '',
    phone: '',
    bio: ''
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    deviceAlerts: true,
    weeklyReports: true,
    marketingUpdates: false,
    emailAddress: '',
    phoneNumber: ''
  }
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const savedSettings = localStorage.getItem('userSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Update profile settings
  const updateProfile = (profile: UserProfile) => {
    setUserSettings(prevSettings => ({
      ...prevSettings,
      profile
    }));
  };

  // Update notification preferences
  const updateNotifications = (notifications: NotificationPreferences) => {
    setUserSettings(prevSettings => ({
      ...prevSettings,
      notifications
    }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    setUserSettings(defaultSettings);
    localStorage.removeItem('userSettings');
  };

  return (
    <SettingsContext.Provider value={{
      userSettings,
      updateProfile,
      updateNotifications,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 