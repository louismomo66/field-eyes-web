import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faLeaf } from '@fortawesome/free-solid-svg-icons';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      await login(username, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
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
                <h2 className="mb-4" style={{ color: '#052816', fontWeight: '600', fontSize: '1.5rem' }}>Welcome Back</h2>
                
                {error && (
                  <div className="alert alert-danger mb-4 py-2" role="alert" style={{ fontSize: '0.9rem' }}>
                    {error}
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="password" className="form-label text-muted small mb-0">Password</label>
                      <Link to="/forgot-password" style={{ color: '#62A800', textDecoration: 'none', fontSize: '0.75rem' }}>
                        Forgot password?
                      </Link>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none', padding: '0.5rem 0.75rem' }}>
                        <FontAwesomeIcon icon={faLock} style={{ color: '#62A800' }} />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  >
                    Sign In
                  </button>
                  
                  <div className="text-center">
                    <p className="mb-0 small">
                      Don't have an account? {' '}
                      <Link to="/signup" style={{ color: '#62A800', textDecoration: 'none', fontWeight: '500' }}>
                        Sign Up
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
              Smart Agricultural Monitoring
            </h2>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px' }}>
              Get real-time insights into your farm's performance with our advanced sensor technology and data analytics platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;