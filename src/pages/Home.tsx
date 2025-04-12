import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Device } from '../types';
import { deviceApi } from '../services/api';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  generateDeviceNotifications, 
  requestNotificationPermission,
  Notification as NotificationType
} from '../services/notificationsService';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faSeedling, 
  faTemperatureHigh, 
  faExclamationTriangle,
  faBell,
  faCloudRain,
  faChartLine,
  faInfoCircle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [deviceCode, setDeviceCode] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching devices from Home component...');
        const response = await deviceApi.getDevices();
        console.log('Home component received devices response:', response);
        console.log('Home component devices data:', response.data);
        console.log('Setting devices state with:', response.data || []);
        setDevices(response.data || []);
        
        // Generate notifications based on device data
        if (response.data && response.data.length > 0) {
          console.log('Generating notifications for devices:', response.data.length);
          generateDeviceNotifications(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch devices in Home component:', err);
        setError('Failed to fetch devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
    
    // Request permission for browser notifications
    requestNotificationPermission();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchDevices, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        // Get notifications from our service
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up interval to refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLinkDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceCode.trim()) {
      setError('Device code is required');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Call the real API to register the device
      await deviceApi.registerDevice({
        serial_number: deviceCode,
        device_type: deviceType || "soil_sensor" // Default to soil_sensor if none selected
      });
      
      // On success, close the modal first 
      setShowAddDeviceModal(false);
      
      // Then refresh the devices list
      try {
        const devicesResponse = await deviceApi.getDevices();
        setDevices(devicesResponse.data || []);
      } catch (deviceErr) {
        console.error("Error fetching updated devices:", deviceErr);
      }
      
      // Clear the form fields
      setDeviceCode('');
      setDeviceType('');
    } catch (err: any) {
      console.error("Error linking device:", err);
      setError(err.response?.data?.message || 'Failed to link device');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDevice = (deviceSerialNumber: string) => {
    console.log('Navigating to dashboard with serial number:', deviceSerialNumber);
    navigate('/dashboard', { state: { deviceSerialNumber } });
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return 'success';
    if (level > 30) return 'warning';
    return 'danger';
  };

  // Add useEffect to focus the input when modal opens
  useEffect(() => {
    if (showAddDeviceModal) {
      // Short timeout to ensure DOM is ready
      setTimeout(() => {
        const input = document.getElementById('deviceCode');
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [showAddDeviceModal]);

  // Add a function to open the modal
  const openAddDeviceModal = () => {
    // Clear any previous data and errors
    setDeviceCode('');
    setDeviceType('');
    setError(null);
    
    // Open the modal
    setShowAddDeviceModal(true);
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="container-fluid p-0">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
            <div className="card-body py-4">
              <div className="d-flex justify-content-center">
                <div className="text-center">
                  <h1 className="mb-1" style={{ fontWeight: 500, color: '#2c3e50' }}>Welcome, {user?.username}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Your Devices</h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={openAddDeviceModal}
                  style={{ 
                    backgroundColor: '#62A800',
                    borderColor: '#62A800'
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Device
                </button>
              </div>
            </div>
            
            {loading && devices.length === 0 ? (
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mb-0">Loading your devices...</p>
              </div>
            ) : error ? (
              <div className="card-body">
                <div className="alert alert-danger">{error}</div>
              </div>
            ) : devices.length === 0 ? (
              <div className="card-body text-center py-5">
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <div className="mb-4">
                    <FontAwesomeIcon icon={faSeedling} size="3x" className="text-muted" />
                  </div>
                  <h4>No Devices Found</h4>
                  <p className="text-muted mb-4">You don't have any devices registered yet. Add your first device to start monitoring your fields.</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={openAddDeviceModal}
                    style={{ 
                      backgroundColor: '#62A800',
                      borderColor: '#62A800'
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add Your First Device
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Device</th>
                        <th>Status</th>
                        <th>Battery</th>
                        <th>Last Reading</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map(device => (
                        <tr key={device.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDevice(device.serial_number)}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <div className="bg-light rounded-circle p-2">
                                  <FontAwesomeIcon icon={faSeedling} className="text-success" />
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-1">{device.name}</h6>
                                <small className="text-muted">{device.serial_number}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusColor(device.status)}`}>
                              {device.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '6px', width: '60px' }}>
                                <div className={`progress-bar bg-${getBatteryColor(device.battery)}`} style={{ width: `${device.battery}%` }}></div>
                              </div>
                              <span>{device.battery}%</span>
                            </div>
                          </td>
                          <td className="text-muted">{formatTimeAgo(device.last_reading)}</td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDevice(device.serial_number);
                              }}
                              style={{ 
                                color: '#62A800',
                                borderColor: '#62A800'
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4 d-flex flex-column">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center py-1">
                <h5 className="mb-0">Recent Notifications</h5>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary rounded-pill me-2" style={{ backgroundColor: '#62A800' }}>
                    {unreadCount}
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleMarkAllAsRead}
                      title="Mark all as read"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {notificationsLoading ? (
                <div className="p-4 text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-muted mb-0">No notifications yet</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {notifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`list-group-item border-0 py-3 ${!notification.read ? 'bg-light' : ''}`}
                      style={{ borderLeft: !notification.read ? '3px solid #62A800' : 'none' }}
                    >
                      <div className="d-flex">
                        <div className="me-3">
                          <FontAwesomeIcon 
                            icon={
                              notification.type === 'warning' ? faExclamationTriangle :
                              notification.type === 'alert' ? faTemperatureHigh :
                              notification.type === 'success' ? faCheck :
                              faInfoCircle
                            } 
                            className={
                              notification.type === 'warning' ? 'text-warning' :
                              notification.type === 'alert' ? 'text-danger' :
                              notification.type === 'success' ? 'text-success' :
                              'text-info'
                            } 
                            size="lg"
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <strong>{notification.deviceName || 'System'}</strong>
                            <small className="text-muted">{formatTimeAgo(notification.timestamp)}</small>
                          </div>
                          <p className="mb-0 mt-1">{notification.message}</p>
                          {!notification.read && (
                            <div className="mt-2 text-end">
                              <button 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={() => handleMarkAsRead(notification.id)}
                                style={{ 
                                  color: '#62A800',
                                  borderColor: '#62A800',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Mark as read
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card-footer bg-white border-top-0 text-center py-3">
              <button 
                className="btn btn-link text-decoration-none"
                style={{ color: '#62A800' }}
                onClick={handleMarkAllAsRead}
              >
                {notifications.length > 0 ? 'View All Notifications' : 'Check Later'}
              </button>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3" style={{ backgroundColor: 'rgba(98,168,0,0.1)' }}>
                      <FontAwesomeIcon icon={faCloudRain} style={{ color: '#62A800' }} />
                    </div>
                    <h6 className="mb-0">Irrigation Status</h6>
                  </div>
                  <p className="text-muted small mb-0">Next scheduled irrigation: <strong>Tomorrow, 6:00 AM</strong></p>
                  <div className="d-grid mt-3">
                    <button className="btn btn-sm btn-outline-primary" style={{ color: '#62A800', borderColor: '#62A800' }}>Adjust Schedule</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                      <FontAwesomeIcon icon={faChartLine} className="text-success" />
                    </div>
                    <h6 className="mb-0">Recent Insights</h6>
                  </div>
                  <p className="text-muted small mb-0">Soil moisture has improved by <strong>15%</strong> in the last week.</p>
                  <div className="d-grid mt-3">
                    <button className="btn btn-sm btn-outline-success">View Analytics</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <>
          <div 
            className="modal show" 
            style={{ 
              display: 'block', 
              paddingRight: '15px',
              overflowX: 'hidden',
              overflowY: 'auto',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1055
            }}
            tabIndex={-1}
            role="dialog"
            aria-labelledby="linkDeviceModalLabel"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title" id="linkDeviceModalLabel">Link New Device</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowAddDeviceModal(false);
                      setError(null);
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleLinkDevice}>
                  <div className="modal-body">
                    <p className="text-muted mb-4">
                      Enter the serial number found on your Field Eyes sensor or on its packaging.
                    </p>
                    
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label htmlFor="deviceCode" className="form-label">Serial Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="deviceCode"
                        placeholder="e.g. SN12345678"
                        value={deviceCode}
                        onChange={(e) => setDeviceCode(e.target.value)}
                        disabled={loading}
                        autoFocus
                      />
                      <div className="form-text">
                        This is typically a number starting with SN followed by 8-10 digits
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="deviceType" className="form-label">Device Type</label>
                      <select
                        className="form-select"
                        id="deviceType"
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select a device type</option>
                        <option value="soil_sensor">Soil Sensor</option>
                        <option value="weather_station">Weather Station</option>
                        <option value="irrigation_controller">Irrigation Controller</option>
                        <option value="crop_monitor">Crop Monitor</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowAddDeviceModal(false);
                        setError(null);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !deviceCode.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Linking...
                        </>
                      ) : 'Link Device'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1050
            }}
            onClick={() => {
              if (!loading) {
                setShowAddDeviceModal(false);
                setError(null);
              }
            }}
          ></div>
        </>
      )}

      {/* Demo notification generator button (remove in production) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, opacity: 0.7 }}>
        <button 
          className="btn btn-sm btn-dark"
          onClick={() => generateDeviceNotifications(devices)}
          title="Generate test notifications"
        >
          <FontAwesomeIcon icon={faBell} className="me-2" />
          Test Notifications
        </button>
      </div>
    </div>
  );
};

export default Home;