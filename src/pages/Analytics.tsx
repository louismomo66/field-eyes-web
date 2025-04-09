import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { deviceApi } from '../services/api';
import { Device, DeviceData } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faMicrochip,
  faCalendarAlt,
  faFilter,
  faCheckCircle,
  faCalendarDay,
  faCalendarWeek,
  faCalendarDays
} from '@fortawesome/free-solid-svg-icons';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date range selection
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);

  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await deviceApi.getDevices();
        const fetchedDevices = response.data || [];
        setDevices(fetchedDevices);
        
        // If device was passed from another page
        const deviceFromLocation = location.state?.device;
        if (deviceFromLocation) {
          setSelectedDevice(deviceFromLocation);
        } else if (fetchedDevices.length > 0) {
          setSelectedDevice(fetchedDevices[0]);
        }
      } catch (err: any) {
        setError('Failed to fetch devices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user, location.state]);

  // Update fetch device data to respect custom date range
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!selectedDevice) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine the time range parameter for the API
        let timeFrameParam = '';
        
        if (customDateRange) {
          // Format dates for API
          const start = new Date(startDate).toISOString().split('T')[0];
          const end = new Date(endDate).toISOString().split('T')[0];
          timeFrameParam = `custom&start=${start}&end=${end}`;
        } else {
          timeFrameParam = timeRange; // 'day', 'week', 'month'
        }
        
        const response = await deviceApi.analyzeDeviceData(
          selectedDevice.serial_number, 
          timeFrameParam
        );
        
        setDeviceData(response.data || []);
      } catch (err: any) {
        setError('Failed to fetch device data');
        console.error(err);
        
        // If API call fails, set empty data array
        setDeviceData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeviceData();
  }, [selectedDevice, timeRange, customDateRange, startDate, endDate]);

  // Format data for charts
  const chartData = deviceData.map(data => ({
    timestamp: new Date(data.created_at).toLocaleString(),
    temperature: data.temperature,
    humidity: data.humidity,
    soilMoisture: data.soil_moisture,
    soilTemperature: data.soil_temperature,
    ph: data.ph,
    nitrogen: data.nitrogen,
    phosphorous: data.phosphorous,
    potassium: data.potassium
  }));

  // Get the device status badge color
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

  // Handle date range toggle
  const handleTimeRangeChange = (range: 'day' | 'week' | 'month') => {
    setTimeRange(range);
    setCustomDateRange(false);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1" style={{ fontWeight: 600, color: '#052816' }}>Analytics</h1>
          <p className="text-muted mb-0">Analyze your field data and identify trends</p>
        </div>
        <div className="d-flex align-items-center">
          <button 
            className="btn shadow-sm me-3"
            onClick={() => navigate('/dashboard', { state: { device: selectedDevice } })}
            style={{ borderRadius: "10px", backgroundColor: "#62A800", color: "white" }}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border mb-3" style={{ color: '#62A800' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading analytics data...</p>
        </div>
      ) : !selectedDevice ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
          <div className="card-body text-center">
            <h3 className="mb-3">No Device Selected</h3>
            <p className="mb-4">Please select a device from the list to view analytics.</p>
            <button 
              className="btn"
              onClick={() => navigate('/home')}
              style={{ borderRadius: "10px", backgroundColor: "#62A800", color: "white" }}
            >
              Go to Home
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Main content - Charts */}
          <div className="col-lg-9 mb-4">
            {/* Date Range Controls */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <div className="mb-3 mb-md-0">
                    <h5 className="mb-2">Data Time Range</h5>
                    <div className="btn-group shadow-sm">
                      <button 
                        className={`btn ${!customDateRange && timeRange === 'day' ? 'active' : ''}`}
                        onClick={() => handleTimeRangeChange('day')}
                        style={{ 
                          borderRadius: "10px 0 0 10px", 
                          backgroundColor: !customDateRange && timeRange === 'day' ? '#62A800' : 'white',
                          color: !customDateRange && timeRange === 'day' ? 'white' : '#052816',
                          borderColor: '#e2e8f0'
                        }}
                      >
                        <FontAwesomeIcon icon={faCalendarDay} className="me-2" />
                        Last 24h
                      </button>
                      <button 
                        className={`btn ${!customDateRange && timeRange === 'week' ? 'active' : ''}`}
                        onClick={() => handleTimeRangeChange('week')}
                        style={{ 
                          backgroundColor: !customDateRange && timeRange === 'week' ? '#62A800' : 'white',
                          color: !customDateRange && timeRange === 'week' ? 'white' : '#052816',
                          borderColor: '#e2e8f0'
                        }}
                      >
                        <FontAwesomeIcon icon={faCalendarWeek} className="me-2" />
                        Last Week
                      </button>
                      <button 
                        className={`btn ${!customDateRange && timeRange === 'month' ? 'active' : ''}`}
                        onClick={() => handleTimeRangeChange('month')}
                        style={{ 
                          borderRadius: "0 10px 10px 0", 
                          backgroundColor: !customDateRange && timeRange === 'month' ? '#62A800' : 'white',
                          color: !customDateRange && timeRange === 'month' ? 'white' : '#052816',
                          borderColor: '#e2e8f0'
                        }}
                      >
                        <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                        Last Month
                      </button>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                    <div className="form-check mb-2 mb-md-0 me-md-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="customDateRange" 
                        checked={customDateRange}
                        onChange={(e) => setCustomDateRange(e.target.checked)}
                        style={{ borderColor: '#62A800' }}
                      />
                      <label className="form-check-label" htmlFor="customDateRange">
                        Custom Date Range
                      </label>
                    </div>
                    
                    <div className="d-flex">
                      <div className="me-2">
                        <input 
                          type="date" 
                          className="form-control"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={!customDateRange}
                          style={{ borderColor: customDateRange ? '#62A800' : '#e2e8f0', borderRadius: "10px" }}
                        />
                      </div>
                      <div>
                        <input 
                          type="date" 
                          className="form-control"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={!customDateRange}
                          style={{ borderColor: customDateRange ? '#62A800' : '#e2e8f0', borderRadius: "10px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row g-4">
              {/* Temperature & Humidity Chart */}
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                  <div className="card-header bg-white p-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Temperature & Humidity</h5>
                    <div className="badge px-3 py-2 shadow-sm" style={{ 
                      borderRadius: "10px", 
                      backgroundColor: "rgba(5, 40, 22, 0.1)",
                      color: "#052816"
                    }}>
                      <FontAwesomeIcon icon={faFilter} className="me-2" style={{ color: '#62A800' }} />
                      {customDateRange 
                        ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                        : `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`
                      }
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-muted mb-4">
                      Track air temperature and humidity levels for your selected timeframe.
                    </p>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 12 }} 
                            interval={timeRange === 'day' ? 3 : 0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            stroke="#6c757d"
                          />
                          <YAxis yAxisId="left" stroke="#ff7300" />
                          <YAxis yAxisId="right" orientation="right" stroke="#052816" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.15)'
                            }} 
                          />
                          <Legend iconType="circle" />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature (°C)"
                            stroke="#ff7300"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="humidity"
                            name="Humidity (%)"
                            stroke="#052816"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Conditions Chart */}
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                  <div className="card-header bg-white p-3 border-0">
                    <h5 className="mb-0">Soil Conditions</h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-muted mb-4">
                      Track soil moisture and temperature over time to ensure optimal growing conditions.
                    </p>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 12 }} 
                            interval={timeRange === 'day' ? 3 : 0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            stroke="#6c757d"
                          />
                          <YAxis yAxisId="left" stroke="#62A800" />
                          <YAxis yAxisId="right" orientation="right" stroke="#FF5722" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.15)'
                            }} 
                          />
                          <Legend iconType="circle" />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="soilMoisture"
                            name="Soil Moisture (%)"
                            stroke="#62A800"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="soilTemperature"
                            name="Soil Temperature (°C)"
                            stroke="#FF5722"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Nutrients Chart (NPK) */}
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                  <div className="card-header bg-white p-3 border-0">
                    <h5 className="mb-0">Soil Nutrients (N-P-K)</h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-muted mb-4">
                      Monitor nitrogen, phosphorous, and potassium levels to ensure proper plant nutrition.
                    </p>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 12 }} 
                            interval={timeRange === 'day' ? 3 : 0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            stroke="#6c757d"
                          />
                          <YAxis stroke="#6c757d" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.15)'
                            }} 
                          />
                          <Legend iconType="circle" />
                          <Bar dataKey="nitrogen" name="Nitrogen (mg/kg)" fill="#62A800" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="phosphorous" name="Phosphorous (mg/kg)" fill="#ffc107" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="potassium" name="Potassium (mg/kg)" fill="#052816" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil pH Chart */}
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                  <div className="card-header bg-white p-3 border-0">
                    <h5 className="mb-0">Soil pH</h5>
                  </div>
                  <div className="card-body p-4">
                    <p className="text-muted mb-4">
                      Track soil pH to ensure it remains in the optimal range for your plants (6.0-7.0 for most plants).
                    </p>
                    <div style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 12 }} 
                            interval={timeRange === 'day' ? 3 : 0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            stroke="#6c757d"
                          />
                          <YAxis domain={[5, 8]} stroke="#052816" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 0.25rem 0.5rem rgba(0, 0, 0, 0.15)'
                            }} 
                          />
                          <Legend iconType="circle" />
                          <Line type="monotone" dataKey="ph" name="pH" stroke="#052816" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey={() => 6.0} stroke="#FF5722" strokeDasharray="5 5" name="Lower Optimal (6.0)" strokeWidth={2} />
                          <Line type="monotone" dataKey={() => 7.0} stroke="#FF5722" strokeDasharray="5 5" name="Upper Optimal (7.0)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar - Device List */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: "15px", top: "20px" }}>
              <div className="card-header bg-white p-3 border-0">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faMicrochip} className="me-2" style={{ color: '#62A800' }} />
                  Your Devices
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {devices.map(device => (
                    <button 
                      key={device.id}
                      className={`list-group-item list-group-item-action border-0 p-3 ${selectedDevice?.id === device.id ? 'active' : ''}`}
                      onClick={() => setSelectedDevice(device)}
                      style={{ 
                        backgroundColor: selectedDevice?.id === device.id ? '#62A800' : '', 
                        color: selectedDevice?.id === device.id ? 'white' : ''
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className={`mb-1 ${selectedDevice?.id === device.id ? 'text-white' : ''}`}>
                            {device.name || device.device_type}
                          </h6>
                          <p className={`mb-0 small ${selectedDevice?.id === device.id ? 'text-white-50' : 'text-muted'}`}>
                            {device.location || device.serial_number}
                          </p>
                        </div>
                        <div>
                          {selectedDevice?.id === device.id ? (
                            <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                          ) : (
                            <span className="badge px-2 py-1" style={{ 
                              fontSize: '0.7rem', 
                              borderRadius: "5px",
                              backgroundColor: getStatusColor(device.status) === 'success' ? '#62A800' : 
                                           getStatusColor(device.status) === 'danger' ? '#dc3545' : '#ffc107',
                              color: 'white'
                            }}>
                              {device.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Device Info Card */}
                {selectedDevice && (
                  <div className="p-3 border-top">
                    <h6 className="mb-3">Selected Device Info</h6>
                    <div className="mb-2">
                      <div className="small text-muted">Type</div>
                      <div>{selectedDevice.device_type}</div>
                    </div>
                    <div className="mb-2">
                      <div className="small text-muted">Serial Number</div>
                      <div>{selectedDevice.serial_number}</div>
                    </div>
                    <div className="mb-2">
                      <div className="small text-muted">Battery</div>
                      <div className="progress mt-1" style={{ height: "6px", borderRadius: "3px" }}>
                        <div 
                          className="progress-bar"
                          role="progressbar" 
                          style={{ 
                            width: `${selectedDevice.battery}%`,
                            backgroundColor: selectedDevice.battery > 70 ? '#62A800' : 
                                         selectedDevice.battery > 30 ? '#ffc107' : '#dc3545'
                          }}
                          aria-valuenow={selectedDevice.battery}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between small mt-1">
                        <span>{selectedDevice.battery}%</span>
                        <span style={{ 
                          color: selectedDevice.battery > 70 ? '#62A800' : 
                                selectedDevice.battery > 30 ? '#ffc107' : '#dc3545'
                        }}>
                          {selectedDevice.battery > 70 ? 'Good' : selectedDevice.battery > 30 ? 'Fair' : 'Low'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="small text-muted">Signal Strength</div>
                      <div className="progress mt-1" style={{ height: "6px", borderRadius: "3px" }}>
                        <div 
                          className="progress-bar"
                          role="progressbar" 
                          style={{ 
                            width: `${selectedDevice.signal}%`,
                            backgroundColor: selectedDevice.signal > 70 ? '#62A800' : 
                                         selectedDevice.signal > 40 ? '#ffc107' : '#dc3545'
                          }}
                          aria-valuenow={selectedDevice.signal}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between small mt-1">
                        <span>{selectedDevice.signal}%</span>
                        <span style={{ 
                          color: selectedDevice.signal > 70 ? '#62A800' : 
                                selectedDevice.signal > 40 ? '#ffc107' : '#dc3545' 
                        }}>
                          {selectedDevice.signal > 70 ? 'Strong' : selectedDevice.signal > 40 ? 'Moderate' : 'Weak'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm w-100"
                      onClick={() => navigate('/map', { state: { device: selectedDevice } })}
                      style={{ 
                        borderRadius: "8px", 
                        backgroundColor: 'rgba(5, 40, 22, 0.1)', 
                        color: '#052816' 
                      }}
                    >
                      View on Map
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 