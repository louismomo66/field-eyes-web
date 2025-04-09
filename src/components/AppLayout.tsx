import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../utils/LanguageContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faTachometerAlt, 
  faChartLine, 
  faMapMarkedAlt, 
  faCog, 
  faSignOutAlt,
  faBars,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import '../styles/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`} style={{ 
        background: 'linear-gradient(to bottom, #052816 0%, #084023 100%)',
        boxShadow: '2px 0 15px rgba(0,0,0,0.15)',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        width: menuCollapsed ? '80px' : '250px',
        transition: 'width 0.3s ease, background 0.3s ease',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="sidebar-header" style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(5px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div className={`${menuCollapsed ? 'w-100 d-flex justify-content-center' : ''}`} style={{
            maxWidth: menuCollapsed ? '100%' : '80%'
          }}>
            <img 
              src="/Sponsor.png" 
              alt="FieldEyes Logo" 
              style={{ 
                height: '45px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))'
              }}
            />
          </div>
          
          {!menuCollapsed && (
            <p style={{ 
              fontSize: '0.7rem', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '0',
              marginTop: '0.5rem',
              textAlign: 'center',
              letterSpacing: '0.03em',
              fontWeight: '300',
              lineHeight: '1.2',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Sensors for Precision Agriculture
            </p>
          )}
          
          <button 
            className="toggle-menu" 
            onClick={toggleMenu}
            style={{ 
              color: '#62A800',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 10px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              position: menuCollapsed ? 'absolute' : 'relative',
              right: menuCollapsed ? '50%' : 'auto',
              bottom: menuCollapsed ? '-15px' : 'auto',
              transform: menuCollapsed ? 'translateX(50%)' : 'none',
              zIndex: 5
            }}
            aria-label={menuCollapsed ? "Expand Menu" : "Collapse Menu"}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div className="sidebar-menu" style={{
          padding: '1.5rem 0.5rem',
          height: 'calc(100% - 180px)',
          overflowY: 'auto'
        }}>
          <ul style={{
            padding: '0',
            margin: '0',
            listStyle: 'none'
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <Link 
                to="/home" 
                className={isActive('/home') ? 'active' : ''}
                style={{ 
                  backgroundColor: isActive('/home') ? 'rgba(98,168,0,0.9)' : 'transparent',
                  color: isActive('/home') ? 'white' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  margin: '0 0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  boxShadow: isActive('/home') ? '0 4px 12px rgba(98,168,0,0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive('/home') && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #62A800, #4A8000)'
                  }}></div>
                )}
                <FontAwesomeIcon icon={faHome} style={{ 
                  fontSize: '1.1rem',
                  marginRight: menuCollapsed ? '0' : '0.85rem',
                  width: '20px',
                  textAlign: 'center',
                  color: isActive('/home') ? 'white' : '#a0c080'
                }} />
                {!menuCollapsed && <span>{t('home')}</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
                style={{ 
                  backgroundColor: isActive('/dashboard') ? 'rgba(98,168,0,0.9)' : 'transparent',
                  color: isActive('/dashboard') ? 'white' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  margin: '0 0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  boxShadow: isActive('/dashboard') ? '0 4px 12px rgba(98,168,0,0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive('/dashboard') && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #62A800, #4A8000)'
                  }}></div>
                )}
                <FontAwesomeIcon icon={faTachometerAlt} style={{ 
                  fontSize: '1.1rem',
                  marginRight: menuCollapsed ? '0' : '0.85rem',
                  width: '20px',
                  textAlign: 'center',
                  color: isActive('/dashboard') ? 'white' : '#a0c080'
                }} />
                {!menuCollapsed && <span>{t('dashboard')}</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <Link 
                to="/analytics" 
                className={isActive('/analytics') ? 'active' : ''}
                style={{ 
                  backgroundColor: isActive('/analytics') ? 'rgba(98,168,0,0.9)' : 'transparent',
                  color: isActive('/analytics') ? 'white' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  margin: '0 0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  boxShadow: isActive('/analytics') ? '0 4px 12px rgba(98,168,0,0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive('/analytics') && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #62A800, #4A8000)'
                  }}></div>
                )}
                <FontAwesomeIcon icon={faChartLine} style={{ 
                  fontSize: '1.1rem',
                  marginRight: menuCollapsed ? '0' : '0.85rem',
                  width: '20px',
                  textAlign: 'center',
                  color: isActive('/analytics') ? 'white' : '#a0c080'
                }} />
                {!menuCollapsed && <span>{t('analytics')}</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <Link 
                to="/map" 
                className={isActive('/map') ? 'active' : ''}
                style={{ 
                  backgroundColor: isActive('/map') ? 'rgba(98,168,0,0.9)' : 'transparent',
                  color: isActive('/map') ? 'white' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  margin: '0 0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  boxShadow: isActive('/map') ? '0 4px 12px rgba(98,168,0,0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive('/map') && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #62A800, #4A8000)'
                  }}></div>
                )}
                <FontAwesomeIcon icon={faMapMarkedAlt} style={{ 
                  fontSize: '1.1rem',
                  marginRight: menuCollapsed ? '0' : '0.85rem',
                  width: '20px',
                  textAlign: 'center',
                  color: isActive('/map') ? 'white' : '#a0c080'
                }} />
                {!menuCollapsed && <span>{t('map')}</span>}
              </Link>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <Link 
                to="/settings" 
                className={isActive('/settings') ? 'active' : ''}
                style={{ 
                  backgroundColor: isActive('/settings') ? 'rgba(98,168,0,0.9)' : 'transparent',
                  color: isActive('/settings') ? 'white' : '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '8px',
                  margin: '0 0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  boxShadow: isActive('/settings') ? '0 4px 12px rgba(98,168,0,0.3)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive('/settings') && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '4px',
                    background: 'linear-gradient(to bottom, #62A800, #4A8000)'
                  }}></div>
                )}
                <FontAwesomeIcon icon={faCog} style={{ 
                  fontSize: '1.1rem',
                  marginRight: menuCollapsed ? '0' : '0.85rem',
                  width: '20px',
                  textAlign: 'center',
                  color: isActive('/settings') ? 'white' : '#a0c080'
                }} />
                {!menuCollapsed && <span>{t('settings')}</span>}
              </Link>
            </li>
          </ul>
        </div>
        <div className="sidebar-footer" style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'absolute',
          bottom: 0,
          width: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.1), transparent)'
        }}>
          <button 
            onClick={handleLogout} 
            className="logout-button"
            style={{ 
              color: '#e0e0e0',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.85rem 1.5rem',
              margin: '0 0.5rem',
              display: 'flex',
              alignItems: 'center',
              width: 'calc(100% - 1rem)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ 
              fontSize: '1.1rem',
              marginRight: menuCollapsed ? '0' : '0.85rem',
              width: '20px',
              textAlign: 'center',
              color: '#a0c080'
            }} />
            {!menuCollapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header" style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e0e0e0',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          justifyContent: 'flex-end',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div className="user-info" style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(5,40,22,0.05)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#052816',
              color: 'white',
              marginRight: '10px',
              fontSize: '0.9rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span style={{ 
              color: '#052816', 
              fontWeight: '500',
              fontSize: '0.95rem' 
            }}>
              {user?.username || t('user')}
            </span>
          </div>
        </div>
        <div className="content">
          {children}
        </div>
      </div>

      <style>{`
        /* Additional styles to enhance sidebar appearance */
        .sidebar-menu ul li a:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .logout-button:hover {
          background-color: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .toggle-menu:hover {
          background-color: rgba(255, 255, 255, 0.12) !important;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .app-layout {
          min-height: 100vh;
          display: flex;
          transition: all 0.3s ease;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #f9fafb;
        }
        
        .content {
          flex: 1;
          padding: 1.5rem;
          overflow: auto;
        }
        
        /* Custom scrollbar for sidebar */
        .sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar-menu::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .sidebar-menu::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        
        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Fix for home and dashboard buttons */
        .active {
          background-color: rgba(98,168,0,0.9) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(98,168,0,0.3) !important;
        }
        
        .active svg {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default AppLayout; 