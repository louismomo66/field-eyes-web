import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faKey } from '@fortawesome/free-solid-svg-icons';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if email was passed from forgot password page
  React.useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email, otp, newPassword);
      setSuccess('Your password has been successfully reset');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ 
      height: '100vh',
      backgroundImage: 'url("/african-man-harvesting-vegetables 1.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 40, 22, 0.7)'
      }}></div>
      
      <div className="row h-100 g-0">
        <div className="col-md-5 d-flex align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="p-4 p-md-5" style={{ width: '100%', maxWidth: '500px', marginLeft: '10%' }}>
            <div className="text-center mb-4">
              <div className="d-flex flex-column align-items-center mb-2">
                <img 
                  src="/Sponsor.png" 
                  alt="FieldEyes Logo" 
                  style={{ 
                    height: '80px',
                    width: 'auto',
                    marginBottom: '10px',
                    objectFit: 'contain'
                  }}
                />
                <div className="text-center">
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0', fontSize: '0.8rem' }}>Sensors for Precision Agriculture</p>
                </div>
              </div>
            </div>
            
            <div className="card border-0 shadow-lg" style={{ borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body p-4">
                <h2 className="mb-4" style={{ color: '#052816', fontWeight: '600', fontSize: '1.5rem' }}>Set New Password</h2>
                
                <p className="text-muted small mb-4">
                  Enter the verification code sent to your email along with your new password.
                </p>
                
                {error && (
                  <div className="alert alert-danger mb-4 py-2" role="alert" style={{ fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success mb-4 py-2" role="alert" style={{ fontSize: '0.9rem' }}>
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-muted small mb-1">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none', padding: '0.5rem 0.75rem' }}>
                        <FontAwesomeIcon icon={faEnvelope} style={{ color: '#62A800' }} />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ 
                          borderLeft: 'none', 
                          borderColor: '#ced4da', 
                          borderRadius: '0 5px 5px 0',
                          padding: '0.5rem 0.75rem'
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label text-muted small mb-1">Verification Code</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none', padding: '0.5rem 0.75rem' }}>
                        <FontAwesomeIcon icon={faKey} style={{ color: '#62A800' }} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="otp"
                        placeholder="Enter verification code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ 
                          borderLeft: 'none', 
                          borderColor: '#ced4da', 
                          borderRadius: '0 5px 5px 0',
                          padding: '0.5rem 0.75rem'
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label text-muted small mb-1">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none', padding: '0.5rem 0.75rem' }}>
                        <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ 
                          borderLeft: 'none', 
                          borderColor: '#ced4da', 
                          borderRadius: '0 5px 5px 0',
                          padding: '0.5rem 0.75rem',
                          maxWidth: '100%'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label text-muted small mb-1">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none', padding: '0.5rem 0.75rem' }}>
                        <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ 
                          borderLeft: 'none', 
                          borderColor: '#ced4da', 
                          borderRadius: '0 5px 5px 0',
                          padding: '0.5rem 0.75rem',
                          maxWidth: '100%'
                        }}
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn w-100 py-2 mb-4"
                    style={{ 
                      backgroundColor: '#62A800', 
                      color: 'white',
                      borderRadius: '5px',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  
                  <div className="text-center">
                    <p className="mb-0 small">
                      <Link to="/forgot-password" style={{ color: '#62A800', textDecoration: 'none', fontWeight: '500' }}>
                        Didn't receive a code?
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-7 position-relative d-none d-md-flex align-items-center justify-content-center">
          <div className="text-center position-relative" style={{ zIndex: 1 }}>
            <h2 className="display-4 mb-4" style={{ color: 'white', fontWeight: 'bold' }}>
              Create New Password
            </h2>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px' }}>
              Enter the verification code sent to your email and set a new password for your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 