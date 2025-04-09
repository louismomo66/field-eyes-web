import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceApi } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const deviceTypes = [
  { value: 'soil_sensor', label: 'Soil Sensor' },
  { value: 'weather_station', label: 'Weather Station' },
  { value: 'irrigation_controller', label: 'Irrigation Controller' },
  { value: 'crop_monitor', label: 'Crop Monitor' },
];

const RegisterDevice: React.FC = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!serialNumber) {
      setError('Serial number is required');
      return;
    }

    setLoading(true);

    try {
      const response = await deviceApi.registerDevice({
        serial_number: serialNumber,
        device_type: deviceType || undefined
      });

      setSuccess(response.data.message || 'Device registered successfully');
      
      // Clear form
      setSerialNumber('');
      setDeviceType('');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-5">
          <div className="card mt-5">
            <div className="card-body p-4">
              <h1 className="text-center mb-4">Register New Device</h1>
              
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-3">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="serialNumber" className="form-label">Device Serial Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="serialNumber"
                    required
                    autoComplete="off"
                    autoFocus
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    disabled={loading}
                  />
                  <div className="form-text">Enter the serial number from your device</div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="deviceType" className="form-label">Device Type (Optional)</label>
                  <select
                    className="form-select"
                    id="deviceType"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Auto-detect</option>
                    {deviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    If not specified, the system will use the default type
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : 'Register Device'}
                </button>
                
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDevice; 