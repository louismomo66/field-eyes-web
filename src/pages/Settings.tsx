import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../utils/LanguageContext';
import { useSettings, UserProfile, NotificationPreferences } from '../utils/SettingsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faMobileAlt,
  faBell,
  faGlobe,
  faCog,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Language } from '../utils/LanguageContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { userSettings, updateProfile, updateNotifications } = useSettings();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile form state
  const [profile, setProfile] = useState<UserProfile>({
    username: userSettings.profile.username || user?.username || 'johndoe',
    email: userSettings.profile.email || user?.email || 'john.doe@example.com',
    phone: userSettings.profile.phone || '+1 (555) 123-4567',
    bio: userSettings.profile.bio || 'Farm owner with 15 years of experience in precision agriculture.'
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    userSettings.notifications
  );

  // Language preference
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  // Update local state when user settings change
  useEffect(() => {
    setProfile({
      username: userSettings.profile.username || user?.username || 'johndoe',
      email: userSettings.profile.email || user?.email || 'john.doe@example.com',
      phone: userSettings.profile.phone || '+1 (555) 123-4567',
      bio: userSettings.profile.bio || 'Farm owner with 15 years of experience in precision agriculture.'
    });
    setNotifications(userSettings.notifications);
  }, [userSettings, user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile in settings context (which saves to localStorage)
    updateProfile(profile);
    
    // Show success message
    setSuccessMessage(t('profile_updated'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      setErrorMessage(t('passwords_dont_match'));
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    // In a real app, this would call an API to update the password
    // Simulate successful password change
    setTimeout(() => {
      setSuccessMessage(t('password_updated'));
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveNotifications = () => {
    // Update notifications in settings context (which saves to localStorage)
    updateNotifications(notifications);
    
    // Show success message
    setSuccessMessage(t('notification_settings_saved'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update language in context (which saves to localStorage)
    setLanguage(selectedLanguage);
    
    // Show success message
    setSuccessMessage(t('language_settings_saved'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="mb-1" style={{ fontWeight: 600, color: '#052816' }}>{t('settings')}</h1>
      <p className="text-muted mb-4">{t('manage_your_account_preferences_and_settings')}</p>

      {successMessage && (
        <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {errorMessage}
        </div>
      )}

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-body p-0">
              <div className="list-group list-group-flush rounded-3">
                <button
                  className={`list-group-item list-group-item-action border-0 p-3 ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                  style={{ 
                    backgroundColor: activeTab === 'profile' ? '#62A800' : 'white',
                    color: activeTab === 'profile' ? 'white' : '#052816',
                    borderRadius: activeTab === 'profile' ? "15px" : "0"
                  }}
                >
                  <FontAwesomeIcon icon={faUser} className="me-3" />
                  {t('profile_settings')}
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 p-3 ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                  style={{ 
                    backgroundColor: activeTab === 'security' ? '#62A800' : 'white',
                    color: activeTab === 'security' ? 'white' : '#052816',
                    borderRadius: activeTab === 'security' ? "15px" : "0"
                  }}
                >
                  <FontAwesomeIcon icon={faLock} className="me-3" />
                  {t('password_security')}
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 p-3 ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                  style={{ 
                    backgroundColor: activeTab === 'notifications' ? '#62A800' : 'white',
                    color: activeTab === 'notifications' ? 'white' : '#052816',
                    borderRadius: activeTab === 'notifications' ? "15px" : "0"
                  }}
                >
                  <FontAwesomeIcon icon={faBell} className="me-3" />
                  {t('notifications')}
                </button>
                <button
                  className={`list-group-item list-group-item-action border-0 p-3 ${activeTab === 'language' ? 'active' : ''}`}
                  onClick={() => setActiveTab('language')}
                  style={{ 
                    backgroundColor: activeTab === 'language' ? '#62A800' : 'white',
                    color: activeTab === 'language' ? 'white' : '#052816',
                    borderRadius: activeTab === 'language' ? "15px" : "0"
                  }}
                >
                  <FontAwesomeIcon icon={faGlobe} className="me-3" />
                  {t('language')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-body p-4">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <>
                  <h4 className="mb-4" style={{ color: '#052816' }}>{t('profile_information')}</h4>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <div className="text-center">
                          <div className="position-relative mb-3">
                            <div style={{ 
                              width: '120px', 
                              height: '120px', 
                              borderRadius: '50%', 
                              backgroundColor: '#f0f0f0', 
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              margin: '0 auto',
                              border: '4px solid #62A800'
                            }}>
                              <FontAwesomeIcon icon={faUser} size="3x" style={{ color: '#052816' }} />
                            </div>
                            <button 
                              type="button" 
                              className="btn btn-sm position-absolute bottom-0 end-0 translate-middle" 
                              style={{ 
                                backgroundColor: '#62A800', 
                                color: 'white',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '14px'
                              }}
                            >
                              <i className="fas fa-camera"></i>
                            </button>
                          </div>
                          <p className="mb-1" style={{ fontWeight: '600', color: '#052816' }}>{profile.username}</p>
                          <p className="text-muted small">{profile.email}</p>
                        </div>
                      </div>
                      
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label" style={{ color: '#052816' }}>Full Name</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                              <FontAwesomeIcon icon={faUser} style={{ color: '#62A800' }} />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              value={profile.username}
                              onChange={(e) => setProfile({...profile, username: e.target.value})}
                              style={{ 
                                borderLeft: 'none', 
                                borderColor: '#ced4da', 
                                borderRadius: '0 5px 5px 0'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label" style={{ color: '#052816' }}>Email Address</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                              <FontAwesomeIcon icon={faEnvelope} style={{ color: '#62A800' }} />
                            </span>
                            <input
                              type="email"
                              className="form-control"
                              value={profile.email}
                              onChange={(e) => setProfile({...profile, email: e.target.value})}
                              style={{ 
                                borderLeft: 'none', 
                                borderColor: '#ced4da', 
                                borderRadius: '0 5px 5px 0'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label" style={{ color: '#052816' }}>Phone Number</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                              <FontAwesomeIcon icon={faMobileAlt} style={{ color: '#62A800' }} />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              value={profile.phone}
                              onChange={(e) => setProfile({...profile, phone: e.target.value})}
                              style={{ 
                                borderLeft: 'none', 
                                borderColor: '#ced4da', 
                                borderRadius: '0 5px 5px 0'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label" style={{ color: '#052816' }}>Bio</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            style={{ 
                              borderColor: '#ced4da', 
                              borderRadius: '5px'
                            }}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        className="btn" 
                        style={{ 
                          backgroundColor: '#62A800', 
                          color: 'white',
                          borderRadius: '5px',
                          padding: '0.5rem 1.5rem'
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <>
                  <h4 className="mb-4" style={{ color: '#052816' }}>{t('password_security')}</h4>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label" style={{ color: '#052816' }}>Current Password</label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                          <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          style={{ 
                            borderLeft: 'none', 
                            borderColor: '#ced4da', 
                            borderRadius: '0 5px 5px 0'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: '#052816' }}>New Password</label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                          <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          style={{ 
                            borderLeft: 'none', 
                            borderColor: '#ced4da', 
                            borderRadius: '0 5px 5px 0'
                          }}
                        />
                      </div>
                      <div className="form-text">Password must be at least 8 characters and include a mix of letters, numbers, and symbols.</div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label" style={{ color: '#052816' }}>Confirm New Password</label>
                      <div className="input-group">
                        <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>
                          <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          style={{ 
                            borderLeft: 'none', 
                            borderColor: '#ced4da', 
                            borderRadius: '0 5px 5px 0'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        className="btn" 
                        style={{ 
                          backgroundColor: '#62A800', 
                          color: 'white',
                          borderRadius: '5px',
                          padding: '0.5rem 1.5rem'
                        }}
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <>
                  <h4 className="mb-4" style={{ color: '#052816' }}>{t('notification_preferences')}</h4>
                  
                  <h6 className="mb-3" style={{ color: '#052816' }}>Notification Methods</h6>
                  <div className="mb-4">
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="emailNotifications" 
                        name="email"
                        checked={notifications.email}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.email ? '#62A800' : '' }}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="emailNotifications">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" style={{ color: '#62A800' }} />
                        Email Notifications
                      </label>
                    </div>
                    
                    {notifications.email && (
                      <div className="mb-3 ps-4">
                        <label className="form-label text-muted small">{t('email_for_notifications')}</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={notifications.emailAddress}
                          onChange={(e) => setNotifications({...notifications, emailAddress: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                    )}
                    
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="smsNotifications" 
                        name="sms"
                        checked={notifications.sms}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.sms ? '#62A800' : '' }}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="smsNotifications">
                        <FontAwesomeIcon icon={faMobileAlt} className="me-2" style={{ color: '#62A800' }} />
                        SMS Notifications
                      </label>
                    </div>
                    
                    {notifications.sms && (
                      <div className="mb-3 ps-4">
                        <label className="form-label text-muted small">{t('phone_for_notifications')}</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={notifications.phoneNumber}
                          onChange={(e) => setNotifications({...notifications, phoneNumber: e.target.value})}
                          placeholder="Enter phone number"
                        />
                      </div>
                    )}
                    
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="pushNotifications" 
                        name="push"
                        checked={notifications.push}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.push ? '#62A800' : '' }}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="pushNotifications">
                        <FontAwesomeIcon icon={faBell} className="me-2" style={{ color: '#62A800' }} />
                        Push Notifications (Browser)
                      </label>
                    </div>
                  </div>
                  
                  <h6 className="mb-3" style={{ color: '#052816' }}>Notification Types</h6>
                  <div className="mb-4">
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="deviceAlerts" 
                        name="deviceAlerts"
                        checked={notifications.deviceAlerts}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.deviceAlerts ? '#62A800' : '' }}
                      />
                      <label className="form-check-label" htmlFor="deviceAlerts">
                        Device Alerts (offline, battery low, etc.)
                      </label>
                    </div>
                    
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="weeklyReports" 
                        name="weeklyReports"
                        checked={notifications.weeklyReports}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.weeklyReports ? '#62A800' : '' }}
                      />
                      <label className="form-check-label" htmlFor="weeklyReports">
                        Weekly Summary Reports
                      </label>
                    </div>
                    
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="marketingUpdates" 
                        name="marketingUpdates"
                        checked={notifications.marketingUpdates}
                        onChange={handleNotificationChange}
                        style={{ backgroundColor: notifications.marketingUpdates ? '#62A800' : '' }}
                      />
                      <label className="form-check-label" htmlFor="marketingUpdates">
                        Product Updates & Marketing
                      </label>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ 
                        backgroundColor: '#62A800', 
                        color: 'white',
                        borderRadius: '5px',
                        padding: '0.5rem 1.5rem'
                      }}
                      onClick={handleSaveNotifications}
                    >
                      {t('save_preferences')}
                    </button>
                  </div>
                </>
              )}

              {/* Language Settings */}
              {activeTab === 'language' && (
                <>
                  <h4 className="mb-4" style={{ color: '#052816' }}>{t('language_settings')}</h4>
                  <form onSubmit={handleLanguageSubmit}>
                    <div className="mb-4">
                      <label className="form-label" style={{ color: '#052816' }}>{t('select_language')}</label>
                      <div className="mb-4">
                        <div className="row">
                          <div className="col-md-6">
                            <div 
                              className={`card border ${selectedLanguage === 'en' ? 'border-success' : 'border-light'} mb-3 cursor-pointer`} 
                              onClick={() => setSelectedLanguage('en')}
                              style={{ 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                boxShadow: selectedLanguage === 'en' ? '0 0 0 2px #62A800' : 'none'
                              }}
                            >
                              <div className="card-body d-flex align-items-center p-3">
                                <div 
                                  className="rounded-circle me-3 d-flex justify-content-center align-items-center"
                                  style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    backgroundColor: selectedLanguage === 'en' ? '#62A800' : '#e9ecef'
                                  }}
                                >
                                  {selectedLanguage === 'en' && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: '12px' }} />
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">English</h6>
                                  <p className="text-muted mb-0 small">English (US)</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div 
                              className={`card border ${selectedLanguage === 'fr' ? 'border-success' : 'border-light'} mb-3 cursor-pointer`} 
                              onClick={() => setSelectedLanguage('fr')}
                              style={{ 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                boxShadow: selectedLanguage === 'fr' ? '0 0 0 2px #62A800' : 'none'
                              }}
                            >
                              <div className="card-body d-flex align-items-center p-3">
                                <div 
                                  className="rounded-circle me-3 d-flex justify-content-center align-items-center"
                                  style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    backgroundColor: selectedLanguage === 'fr' ? '#62A800' : '#e9ecef'
                                  }}
                                >
                                  {selectedLanguage === 'fr' && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: '12px' }} />
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">Français</h6>
                                  <p className="text-muted mb-0 small">French</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div 
                              className={`card border ${selectedLanguage === 'es' ? 'border-success' : 'border-light'} mb-3 cursor-pointer`} 
                              onClick={() => setSelectedLanguage('es')}
                              style={{ 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                boxShadow: selectedLanguage === 'es' ? '0 0 0 2px #62A800' : 'none'
                              }}
                            >
                              <div className="card-body d-flex align-items-center p-3">
                                <div 
                                  className="rounded-circle me-3 d-flex justify-content-center align-items-center"
                                  style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    backgroundColor: selectedLanguage === 'es' ? '#62A800' : '#e9ecef'
                                  }}
                                >
                                  {selectedLanguage === 'es' && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: '12px' }} />
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">Español</h6>
                                  <p className="text-muted mb-0 small">Spanish</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div 
                              className={`card border ${selectedLanguage === 'pt' ? 'border-success' : 'border-light'} mb-3 cursor-pointer`} 
                              onClick={() => setSelectedLanguage('pt')}
                              style={{ 
                                borderRadius: '12px', 
                                cursor: 'pointer',
                                boxShadow: selectedLanguage === 'pt' ? '0 0 0 2px #62A800' : 'none'
                              }}
                            >
                              <div className="card-body d-flex align-items-center p-3">
                                <div 
                                  className="rounded-circle me-3 d-flex justify-content-center align-items-center"
                                  style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    backgroundColor: selectedLanguage === 'pt' ? '#62A800' : '#e9ecef'
                                  }}
                                >
                                  {selectedLanguage === 'pt' && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: '12px' }} />
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">Português</h6>
                                  <p className="text-muted mb-0 small">Portuguese</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button
                          type="submit"
                          className="btn btn-primary px-4"
                          style={{ 
                            backgroundColor: '#62A800',
                            borderColor: '#62A800'
                          }}
                        >
                          {t('save_changes')}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 