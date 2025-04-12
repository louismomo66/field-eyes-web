import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { deviceApi } from '../services/api';
import { Device, DeviceData } from '../types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThermometerHalf,
  faWater,
  faSeedling,
  faChartLine,
  faVial,
  faLeaf,
  faBatteryHalf,
  faSignal,
  faInfoCircle,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceLogs, setDeviceLogs] = useState<DeviceData[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      setError(null);
      
      try {
        const response = await deviceApi.getDevices();
        setDevices(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch devices');
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  // Fetch device logs only when a device is selected
  useEffect(() => {
    let isMounted = true;
    
    // Exit if no device is selected
    if (!selectedDevice) {
      return;
    }
    
    // Get the current device's serial number for fetching logs
    const serialNumber = selectedDevice.serial_number;
    console.log(`Setting up logs fetch for device: ${serialNumber}`);
    
    // Clear previous device logs and show loading spinner ONLY when device changes
    setDeviceLogs([]);
    setLogsLoading(true);
    setError(null);
    
    const fetchDeviceLogs = async () => {
      // No loading state changes within the fetch function itself for interval calls
      if (!isMounted) return;
      
      try {
        console.log(`Fetching logs for device ${serialNumber}`);
        const response = await deviceApi.getDeviceLogs(serialNumber);
        
        if (!isMounted) return;
        
        // Only update if we have data
        if (response.data && response.data.length > 0) {
          // Sort logs by created_at timestamp
          const sortedLogs = [...response.data].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          console.log('Logs sorted by created_at:', sortedLogs.map(log => log.created_at));
          console.log('Latest log by created_at:', sortedLogs[0]);
          
          // Update deviceLogs state ONLY
          setDeviceLogs(sortedLogs);
        } else {
          console.log(`No logs found for device ${serialNumber}`);
          setDeviceLogs([]); // Ensure logs are cleared if API returns empty
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching device logs:', err);
          setError(err.response?.data?.message || 'Failed to fetch device logs');
          setDeviceLogs([]);
        }
      } finally {
        // Always ensure loading is turned off after a fetch completes
        if (isMounted) {
          setLogsLoading(false);
        }
      }
    };

    // Execute initial fetch
    fetchDeviceLogs();
    
    // Set up polling interval (every 5 seconds instead of 30)
    const intervalId = setInterval(fetchDeviceLogs, 10000);
    
    return () => {
      clearInterval(intervalId);
      isMounted = false;
    };
  }, [selectedDevice?.serial_number]);

  // Consolidated effect for setting initial selected device AFTER devices are loaded
  useEffect(() => {
    // Only run if devices are finished loading AND we haven't selected a device yet OR the selected device doesn't match the state
    if (!devicesLoading && devices.length > 0) {
      const deviceSerialNumberFromState = location.state?.deviceSerialNumber;
      console.log('Consolidated effect: devices loaded. Serial from state:', deviceSerialNumberFromState);

      let deviceToSelect: Device | null = null;

      if (deviceSerialNumberFromState) {
        console.log('Attempting to find device from state:', deviceSerialNumberFromState);
        deviceToSelect = devices.find(d => d.serial_number === deviceSerialNumberFromState) || null;
        if (!deviceToSelect) {
          console.warn('Device serial from state not found, defaulting to first device.');
        }
      }

      // If no device was found from state, or no state was passed, default to the first device
      if (!deviceToSelect) {
        deviceToSelect = devices[0];
        console.log('Defaulting to first device:', deviceToSelect);
      }
      
      // Only update state if the device to select is different from the current selected device
      if (selectedDevice?.serial_number !== deviceToSelect?.serial_number) {
         console.log('Setting selected device:', deviceToSelect);
         setSelectedDevice(deviceToSelect);
      } else {
         console.log('Device to select is already selected, no state update needed.');
      }
    }
    // Depend on devices list being loaded and the serial number from state
  }, [devicesLoading, devices, location.state?.deviceSerialNumber]);

  // Auto-select first device if none is selected
  useEffect(() => {
    if (!selectedDevice && devices.length > 0) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, selectedDevice]);

  // Render loading state ONLY for the initial device list fetch
  if (devicesLoading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading devices...</p>
      </div>
    );
  }
  
  // Show message if no devices were found after loading
  if (!devicesLoading && devices.length === 0) {
    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-body text-center">
            <h3 className="mb-3">No Devices Found</h3>
            <p className="mb-4">You don't have any devices linked to your account.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/home')}
              style={{ 
                backgroundColor: '#62A800',
                borderColor: '#62A800'
              }}
            >
              Go to Home to Link a Device
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use deviceLogs directly, no need for the mock data fallback
  const data = deviceLogs;
  // Get the latest data (first item after sorting)
  const latestData = data.length > 0 ? data[0] : null;

  // Helper functions for visual elements
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getNutrientLevel = (value: number) => {
    if (value < 30) return 'Low';
    if (value > 60) return 'High';
    return 'Optimal';
  };

  const getNutrientColor = (value: number) => {
    if (value < 30) return 'danger';
    if (value > 60) return 'warning';
    return 'success';
  };

  const getPhStatus = (ph: number) => {
    if (ph < 6.0) return { text: 'Acidic', color: 'warning' };
    if (ph > 7.5) return { text: 'Alkaline', color: 'info' };
    return { text: 'Neutral', color: 'success' };
  };

  // Helper function for dynamic device status based on last reading time
  const getDynamicDeviceStatus = (lastReadingTimestamp?: string): { text: string; color: 'success' | 'danger' | 'warning' } => {
    if (!lastReadingTimestamp) {
      return { text: 'Unknown', color: 'warning' };
    }
    
    const lastReadingDate = new Date(lastReadingTimestamp);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastReadingDate.getTime()) / 1000;
    
    // Consider active if data received within the last 10 minutes (600 seconds)
    if (diffSeconds <= 600) {
      return { text: 'Active', color: 'success' };
    } else {
      // Inactive if no data for more than 10 minutes
      return { text: 'Inactive', color: 'danger' };
    }
  };

  // Dashboard with cards for the selected device
  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1" style={{ fontWeight: 600, color: '#052816' }}>Dashboard</h1>
          {/* <p className="text-muted mb-0">Monitor your field sensors in real-time</p> */}
        </div>
        <div className="d-flex align-items-center">
          <select
            className="form-select me-3 shadow-sm border-0"
            value={selectedDevice?.serial_number || ""}
            onChange={(e) => {
              const selectedSerialNumber = e.target.value;
              const device = devices.find(d => d.serial_number === selectedSerialNumber);
              console.log('Selected device from dropdown (by serial):', device);
              if (device) setSelectedDevice(device);
            }}
            style={{ minWidth: "220px", borderRadius: "10px" }}
          >
            <option value="" disabled>Select Device</option>
            {devices.map(device => (
              <option key={device.id} value={device.serial_number}>
                {device.name || device.device_type} - {device.location || device.serial_number}
              </option>
            ))}
          </select>
          <button 
            className="btn shadow-sm"
            onClick={() => navigate('/analytics', { state: { device: selectedDevice } })}
            style={{ borderRadius: "10px", backgroundColor: "#62A800", color: "white" }}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Analytics
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {!selectedDevice ? (
        <div className="alert alert-info">
          Please select a device from the dropdown above to view data.
        </div>
      ) : (
        <>
          <div className="row mb-4">
            {/* Device info and status card */}
            <div className="col-lg-4 mb-4 mb-lg-0">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                <div className="card-header bg-white p-4 border-0">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{ backgroundColor: 'rgba(98, 168, 0, 0.1)' }}>
                      <FontAwesomeIcon icon={faSeedling} style={{ color: '#62A800' }} size="lg" />
                    </div>
                    <div>
                      <h5 className="mb-1">{selectedDevice.name || selectedDevice.device_type}</h5>
                      <p className="text-muted small mb-0">{selectedDevice.location} · {selectedDevice.serial_number}</p>
                    </div>
                    <div className="ms-auto">
                      {(() => {
                        const dynamicStatus = getDynamicDeviceStatus(latestData?.created_at);
                        return (
                          <span className={`badge px-3 py-2`} style={{ 
                            fontSize: '0.8rem', 
                            borderRadius: "8px",
                            backgroundColor: dynamicStatus.color === 'success' ? '#62A800' : 
                                           dynamicStatus.color === 'danger' ? '#dc3545' : '#ffc107',
                            color: 'white'
                          }}>
                            {dynamicStatus.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="card-body p-4">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faBatteryHalf} className="me-2 text-muted" />
                        <span>Battery</span>
                      </span>
                      <span style={{ 
                        color: getBatteryColor(selectedDevice.battery) === 'success' ? '#62A800' : 
                              getBatteryColor(selectedDevice.battery) === 'danger' ? '#dc3545' : '#ffc107' 
                      }}>
                        {selectedDevice.battery}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: "8px", borderRadius: "5px" }}>
                      <div 
                        className="progress-bar"
                        role="progressbar" 
                        style={{ 
                          width: `${selectedDevice.battery}%`,
                          backgroundColor: getBatteryColor(selectedDevice.battery) === 'success' ? '#62A800' : 
                                         getBatteryColor(selectedDevice.battery) === 'danger' ? '#dc3545' : '#ffc107'
                        }}
                        aria-valuenow={selectedDevice.battery}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faSignal} className="me-2 text-muted" />
                        <span>Signal Strength</span>
                      </span>
                      <span style={{ 
                        color: selectedDevice.signal > 50 ? '#62A800' : '#ffc107'
                      }}>
                        {selectedDevice.signal}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: "8px", borderRadius: "5px" }}>
                      <div 
                        className="progress-bar"
                        role="progressbar" 
                        style={{ 
                          width: `${selectedDevice.signal}%`,
                          backgroundColor: selectedDevice.signal > 50 ? '#62A800' : '#ffc107'
                        }}
                        aria-valuenow={selectedDevice.signal}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between mt-4">
                    <div className="text-center">
                      <div className="small text-muted mb-1">Last Reading</div>
                      <div>
                        {latestData ? 
                          new Date(latestData.created_at).toLocaleString() : 
                          'No readings yet'
                        }
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="small text-muted mb-1">Connected Since</div>
                      <div>{new Date(selectedDevice.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main metrics */}
            <div className="col-lg-8">
              {logsLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border mb-3" style={{ color: '#62A800' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading device data...</p>
                </div>
              ) : (
                <>
                  <div className="row g-4">
                    {/* Temperature and Humidity row */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                        <div className="card-body p-0">
                          <div className="row g-0">
                            {/* Temperature */}
                            <div className="col-md-4 p-4 border-end">
                              <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                                  <FontAwesomeIcon icon={faThermometerHalf} className="text-danger" />
                                </div>
                                <h6 className="mb-0">Temperature</h6>
                              </div>
                              <div className="d-flex align-items-baseline">
                                <h2 className="display-4 mb-0 me-2" style={{ fontWeight: "600" }}>{latestData?.temperature?.toFixed(1) ?? "0.0"}</h2>
                                <span className="text-muted">°C</span>
                              </div>
                              <div className="text-muted small">Air temperature</div>
                            </div>
                            
                            {/* Humidity */}
                            <div className="col-md-4 p-4 border-end">
                              <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: 'rgba(5, 40, 22, 0.1)' }}>
                                  <FontAwesomeIcon icon={faWater} style={{ color: '#052816' }} />
                                </div>
                                <h6 className="mb-0">Humidity</h6>
                              </div>
                              <div className="d-flex align-items-baseline">
                                <h2 className="display-4 mb-0 me-2" style={{ fontWeight: "600" }}>{latestData?.humidity?.toFixed(0) ?? "0"}</h2>
                                <span className="text-muted">%</span>
                              </div>
                              <div className="text-muted small">Air humidity</div>
                            </div>
                            
                            {/* Soil Moisture */}
                            <div className="col-md-4 p-4">
                              <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle p-2 me-3" style={{ backgroundColor: 'rgba(98, 168, 0, 0.1)' }}>
                                  <FontAwesomeIcon icon={faWater} style={{ color: '#62A800' }} />
                                </div>
                                <h6 className="mb-0">Soil Moisture</h6>
                              </div>
                              <div className="d-flex align-items-baseline">
                                <h2 className="display-4 mb-0 me-2" style={{ fontWeight: "600" }}>{latestData?.soil_moisture?.toFixed(0) ?? "0"}</h2>
                                <span className="text-muted">%</span>
                              </div>
                              <div className="text-muted small">Moisture in soil</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Soil Nutrients and pH */}
                    <div className="col-md-7">
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                        <div className="card-header bg-white p-3 border-0 d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Soil Properties</h5>
                          <button className="btn btn-sm" 
                            onClick={() => navigate('/map')}
                            style={{ 
                              borderRadius: "8px", 
                              backgroundColor: 'rgba(5, 40, 22, 0.1)', 
                              color: '#052816'
                            }}
                          >
                            View on Map
                          </button>
                        </div>
                        <div className="card-body">
                          <div className="row g-4">
                            {/* pH Level with gauge visualization */}
                            <div className="col-6">
                              <div className="text-center mb-3">
                                <h6 className="mb-3">pH Level</h6>
                                <div className="position-relative d-inline-block">
                                  <div className="position-relative" style={{ width: '120px', height: '120px' }}>
                                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                                      {/* Background circle */}
                                      <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="3"
                                        strokeDasharray="100, 100"
                                      />
                                      {/* Value arc */}
                                      <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={(latestData?.ph ?? 7) < 6.0 ? '#ffc107' : (latestData?.ph ?? 7) > 7.5 ? '#052816' : '#62A800'}
                                        strokeWidth="3"
                                        strokeDasharray={`${((latestData?.ph ?? 7) / 14) * 100}, 100`}
                                      />
                                    </svg>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                      <div className="display-6" style={{ fontWeight: "600" }}>{latestData?.ph?.toFixed(1) ?? "7.0"}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="badge mt-2 text-white px-3 py-2" style={{ 
                                  borderRadius: "8px", 
                                  fontSize: "0.8rem",
                                  backgroundColor: getPhStatus(latestData?.ph ?? 7).color === 'warning' ? '#ffc107' : 
                                               getPhStatus(latestData?.ph ?? 7).color === 'info' ? '#052816' : '#62A800'
                                }}>
                                  {getPhStatus(latestData?.ph ?? 7).text}
                                </div>
                              </div>
                            </div>
                            
                            {/* NPK Levels */}
                            <div className="col-6">
                              <h6 className="text-center mb-3">NPK Levels</h6>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="d-flex align-items-center">
                                    <div className="me-2" style={{ width: '10px', height: '10px', backgroundColor: '#62A800', borderRadius: '50%' }}></div>
                                    Nitrogen
                                  </span>
                                  <span style={{ 
                                    color: getNutrientColor(latestData?.nitrogen ?? 0) === 'success' ? '#62A800' : 
                                          getNutrientColor(latestData?.nitrogen ?? 0) === 'danger' ? '#dc3545' : '#ffc107'
                                  }}>
                                    {getNutrientLevel(latestData?.nitrogen ?? 0)}
                                  </span>
                                </div>
                                <div className="progress" style={{ height: "8px", borderRadius: "5px" }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${((latestData?.nitrogen ?? 0) / 100) * 100}%`,
                                      backgroundColor: '#62A800'
                                    }}
                                    aria-valuenow={latestData?.nitrogen ?? 0}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="d-flex align-items-center">
                                    <div className="me-2" style={{ width: '10px', height: '10px', backgroundColor: '#ffc107', borderRadius: '50%' }}></div>
                                    Phosphorous
                                  </span>
                                  <span style={{ 
                                    color: getNutrientColor(latestData?.phosphorous ?? 0) === 'success' ? '#62A800' : 
                                          getNutrientColor(latestData?.phosphorous ?? 0) === 'danger' ? '#dc3545' : '#ffc107'
                                  }}>
                                    {getNutrientLevel(latestData?.phosphorous ?? 0)}
                                  </span>
                                </div>
                                <div className="progress" style={{ height: "8px", borderRadius: "5px" }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${((latestData?.phosphorous ?? 0) / 100) * 100}%`,
                                      backgroundColor: '#ffc107'
                                    }}
                                    aria-valuenow={latestData?.phosphorous ?? 0}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="d-flex align-items-center">
                                    <div className="me-2" style={{ width: '10px', height: '10px', backgroundColor: '#052816', borderRadius: '50%' }}></div>
                                    Potassium
                                  </span>
                                  <span style={{ 
                                    color: getNutrientColor(latestData?.potassium ?? 0) === 'success' ? '#62A800' : 
                                          getNutrientColor(latestData?.potassium ?? 0) === 'danger' ? '#dc3545' : '#ffc107'
                                  }}>
                                    {getNutrientLevel(latestData?.potassium ?? 0)}
                                  </span>
                                </div>
                                <div className="progress" style={{ height: "8px", borderRadius: "5px" }}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${((latestData?.potassium ?? 0) / 100) * 100}%`,
                                      backgroundColor: '#052816'
                                    }}
                                    aria-valuenow={latestData?.potassium ?? 0}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="col-md-5">
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                        <div className="card-header bg-white p-3 border-0">
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faClipboardList} className="me-2" style={{ color: '#62A800' }} />
                            <h5 className="mb-0">Recommendations</h5>
                          </div>
                        </div>
                        <div className="card-body p-0">
                          <ul className="list-group list-group-flush">
                            {(latestData?.soil_moisture ?? 0) < 40 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                                      <FontAwesomeIcon icon={faWater} className="text-warning" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">Water needed</h6>
                                    <p className="mb-0 text-muted small">Soil moisture is low, consider watering your plants.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.ph ?? 7) < 6.0 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)' }}>
                                      <FontAwesomeIcon icon={faVial} className="text-secondary" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">pH too low</h6>
                                    <p className="mb-0 text-muted small">Soil is acidic. Consider adding lime to raise the pH.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.ph ?? 7) > 7.5 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)' }}>
                                      <FontAwesomeIcon icon={faVial} className="text-secondary" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">pH too high</h6>
                                    <p className="mb-0 text-muted small">Soil is alkaline. Consider adding sulfur to lower the pH.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.nitrogen ?? 0) < 30 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                                      <FontAwesomeIcon icon={faLeaf} className="text-success" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">Low nitrogen</h6>
                                    <p className="mb-0 text-muted small">Consider adding nitrogen-rich fertilizer.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.phosphorous ?? 0) < 20 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                                      <FontAwesomeIcon icon={faLeaf} className="text-warning" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">Low phosphorous</h6>
                                    <p className="mb-0 text-muted small">Consider adding phosphorous-rich fertilizer for better flowering/fruiting.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.potassium ?? 0) < 25 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)' }}>
                                      <FontAwesomeIcon icon={faLeaf} className="text-purple" style={{ color: '#6f42c1' }} />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">Low potassium</h6>
                                    <p className="mb-0 text-muted small">Consider adding potassium-rich fertilizer for overall plant health.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {(latestData?.soil_moisture ?? 0) >= 40 && 
                             (latestData?.ph ?? 7) >= 6.0 && (latestData?.ph ?? 7) <= 7.5 && 
                             (latestData?.nitrogen ?? 0) >= 30 && 
                             (latestData?.phosphorous ?? 0) >= 20 && 
                             (latestData?.potassium ?? 0) >= 25 && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                                      <FontAwesomeIcon icon={faLeaf} className="text-success" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">All good!</h6>
                                    <p className="mb-0 text-muted small">Your soil conditions are optimal for most plants.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                            {/* In case there are no recommendations, show this */}
                            {(!latestData || (
                              (latestData?.soil_moisture === 0 || latestData?.soil_moisture === undefined) &&
                              (latestData?.ph === 0 || latestData?.ph === undefined) &&
                              (latestData?.nitrogen === 0 || latestData?.nitrogen === undefined) &&
                              (latestData?.phosphorous === 0 || latestData?.phosphorous === undefined) &&
                              (latestData?.potassium === 0 || latestData?.potassium === undefined))) && (
                              <li className="list-group-item border-0 py-3">
                                <div className="d-flex">
                                  <div className="me-3">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>
                                      <FontAwesomeIcon icon={faInfoCircle} className="text-primary" />
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1">No data available</h6>
                                    <p className="mb-0 text-muted small">Check sensor connectivity or wait for the next reading.</p>
                                  </div>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;  


