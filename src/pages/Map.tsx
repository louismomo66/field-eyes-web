import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../utils/LanguageContext';
import { deviceApi } from '../services/api';
import { Device } from '../types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThermometerHalf, 
  faTint, 
  faFlask, 
  faSpinner, 
  faExclamationTriangle,
  faMapMarkerAlt,
  faLayerGroup,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

// Import ArcGIS types and modules
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import Home from '@arcgis/core/widgets/Home';
import Expand from '@arcgis/core/widgets/Expand';
import Legend from '@arcgis/core/widgets/Legend';
import Polygon from '@arcgis/core/geometry/Polygon';

import '@arcgis/core/assets/esri/themes/light/main.css';

// Update the DeviceData interface
interface DeviceData {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  temperature: number;
  soil_moisture: number;
  nutrient_level: number;
  nitrogen: number;
  phosphorous: number;
  potassium: number;
  created_at: string;
}

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  
  // Map configuration options
  const [showTemperature, setShowTemperature] = useState(true);
  const [showMoisture, setShowMoisture] = useState(true);
  const [showNutrients, setShowNutrients] = useState(false);
  
  // Add state for storing device locations
  const [deviceLocations, setDeviceLocations] = useState<Record<string, {longitude: number, latitude: number}>>({});
  
  const mapDiv = useRef<HTMLDivElement>(null);
  
  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Add a ref to store the map view for cleanup
  const mapViewRef = useRef<MapView | null>(null);
  
  // Add a ref to store the graphics layer for cleanup
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  
  // Add a ref to store the current abort controller
  const currentRequestRef = useRef<AbortController | null>(null);
  
  // Function to save device locations to localStorage
  const saveDeviceLocations = (locations: Record<string, {longitude: number, latitude: number}>) => {
    localStorage.setItem('device_locations', JSON.stringify(locations));
  };
  
  // Function to load device locations from localStorage
  const loadDeviceLocations = (): Record<string, {longitude: number, latitude: number}> => {
    const saved = localStorage.getItem('device_locations');
    return saved ? JSON.parse(saved) : {};
  };
  
  // Update the cleanupMapResources function
  const cleanupMapResources = () => {
    try {
      // First cancel any pending requests
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
        currentRequestRef.current = null;
      }
      
      // Clear graphics layer first
      if (graphicsLayerRef.current) {
        try {
          graphicsLayerRef.current.removeAll();
        } catch (e) {
          console.warn("Error clearing graphics layer:", e);
        }
        graphicsLayerRef.current = null;
      }
      
      // Then destroy the view
      if (mapViewRef.current) {
        try {
          // Remove all UI widgets first
          if (mapViewRef.current.ui) {
            mapViewRef.current.ui.empty();
          }
          
          // Set container to null to prevent further rendering
          mapViewRef.current.container = null;
        } catch (e) {
          console.warn("Error cleaning up map view UI:", e);
        }
        
        // Use setTimeout to ensure all operations are complete before destroying
        setTimeout(() => {
          try {
            if (mapViewRef.current) {
              // Destroy the view
              mapViewRef.current.destroy();
              mapViewRef.current = null;
            }
          } catch (e) {
            console.error("Error during map view destruction:", e);
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error cleaning up map resources:", err);
    }
  };
  
  // Update the main useEffect for map initialization
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Load saved device locations from localStorage
    const savedLocations = loadDeviceLocations();
    setDeviceLocations(savedLocations);
    
    if (!mapDiv.current) {
      console.warn("Map container not found");
      return;
    }
    
    const initializeMap = async () => {
      try {
        // Create a new GraphicsLayer for device icons and data visualization
        const deviceGraphicsLayer = new GraphicsLayer();
        
        // Create a new map with a topographic basemap
        const map = new Map({
          basemap: "streets-navigation-vector",
          layers: [deviceGraphicsLayer]
        });
        
        // Determine initial center for map
        // Use the first saved location if available, otherwise default to center of US
        let initialCenter = [-98, 39]; // Default center (US)
        let initialZoom = 4; // Default zoom
        
        // If we have saved locations, use the first one as the center
        const locationValues = Object.values(savedLocations);
        if (locationValues.length > 0) {
          initialCenter = [locationValues[0].longitude, locationValues[0].latitude];
          initialZoom = 10; // Zoom in more when we have a specific location
        }
        
        // Create a new MapView
        const view = new MapView({
          container: mapDiv.current!,
          map: map,
          center: initialCenter,
          zoom: initialZoom,
          ui: {
            components: ["zoom", "compass"]
          }
        });
        
        // Add basemap toggle widget
        const basemapToggle = new BasemapToggle({
          view: view,
          nextBasemap: "satellite"
        });
        
        // Add home button widget
        const homeBtn = new Home({
          view: view
        });
        
        // Add widgets to UI
        view.ui.add(basemapToggle, "bottom-right");
        view.ui.add(homeBtn, "top-right");
        
        // Add legend widget in an expandable container
        const legendExpand = new Expand({
          view: view,
          content: new Legend({
            view: view
          }),
          expanded: false,
          expandIconClass: "esri-icon-legend",
          expandTooltip: "Legend"
        });
        
        view.ui.add(legendExpand, "bottom-left");
        
        // Wait for the view to finish loading
        await view.when();
        
        // Only update states if component is still mounted
        if (!isMounted.current) return;
        
        // Set the GraphicsLayer to state
        setGraphicsLayer(deviceGraphicsLayer);
        
        // Set the MapView to state
        setMapView(view);
        
        // Store references for cleanup
        mapViewRef.current = view;
        graphicsLayerRef.current = deviceGraphicsLayer;
      } catch (error) {
        console.error("Error initializing map view:", error);
        if (isMounted.current) {
          setError("Failed to initialize map. Please refresh the page.");
        }
      }
    };
    
    initializeMap();
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      
      try {
        // Clean up map resources
        cleanupMapResources();
      } catch (err) {
        console.error("Error during cleanup:", err);
      }
    };
  }, []);
  
  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isMounted.current) return;
        
        const response = await deviceApi.getDevices();
        setDevices(response.data || []);
        
        // Auto-select first device if available
        if (response.data && response.data.length > 0) {
          setSelectedDevice(response.data[0]);
        }
      } catch (err: any) {
        setError('Failed to fetch devices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  // Function to fetch device data
  const fetchDeviceData = async (deviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the current request's abort controller
      const controller = currentRequestRef.current;
      if (!controller) {
        console.warn('No abort controller available for request');
        return;
      }
      
      // Set a timeout to abort the request if it takes too long
      const timeoutId = setTimeout(() => {
        if (controller.signal.aborted) return;
        controller.abort();
      }, 10000); // 10 second timeout
      
      try {
        // Make the API call without passing the signal directly
        // This avoids AbortError when the component unmounts
        const response = await deviceApi.getDeviceLogs(deviceId);
        
        // Check if component is still mounted before updating state
        if (!isMounted.current) return;
        
        const data = response.data || null;
        setDeviceData(data);
        
        // If we have valid data with coordinates, save the location
        if (data && data.longitude && data.latitude) {
          const newLocations = {
            ...deviceLocations,
            [deviceId]: {
              longitude: data.longitude,
              latitude: data.latitude
            }
          };
          
          // Update state and save to localStorage
          setDeviceLocations(newLocations);
          saveDeviceLocations(newLocations);
        }
      } catch (err: any) {
        // Check if this is an abort error (which is expected during cleanup)
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        // For other errors, re-throw to be caught by the outer catch
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err: any) {
      // Only log and update state if the component is still mounted
      if (isMounted.current) {
        console.error('Failed to fetch device data:', err);
        setError('Failed to load device data');
        setDeviceData(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Function to show all saved device locations on the map
  const showAllDeviceLocations = () => {
    if (!mapView || !graphicsLayer) return;
    
    // Clear any existing graphics
    graphicsLayer.removeAll();
    
    // Check if we have any saved locations
    if (Object.keys(deviceLocations).length === 0) {
      console.log('No saved device locations');
      return;
    }
    
    const points: Point[] = [];
    
    // Add a marker for each saved location
    Object.entries(deviceLocations).forEach(([deviceId, location]) => {
      const point = new Point({
        longitude: location.longitude,
        latitude: location.latitude,
        spatialReference: mapView.spatialReference
      });
      
      points.push(point);
      
      // Create a graphic for this location
      const graphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          color: [0, 120, 255],
          size: 12,
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        }),
        attributes: {
          deviceId: deviceId,
        },
        popupTemplate: {
          title: `Device ID: ${deviceId}`,
          content: `Location: ${location.longitude.toFixed(5)}, ${location.latitude.toFixed(5)}`
        }
      });
      
      graphicsLayer.add(graphic);
    });
    
    // Zoom to the points if there are any
    if (points.length > 0) {
      mapView.goTo(points);
    }
  };

  // Update map with device data
  useEffect(() => {
    // Skip if any required dependencies are missing
    if (!mapView || !graphicsLayer || loading) return;
    if (mapView.destroyed) return;

    try {
      // Clear existing graphics
      graphicsLayer.removeAll();

      // If we have device data, use it to render the map
      if (deviceData && deviceData.longitude && deviceData.latitude) {
        renderMapWithData(deviceData);
      } 
      // If no device data but we have a selected device and saved location, use that
      else if (selectedDevice && deviceLocations[selectedDevice.id.toString()]) {
        const savedLocation = deviceLocations[selectedDevice.id.toString()];
        
        // Create a basic point with the saved location
        const point = new Point({
          longitude: savedLocation.longitude,
          latitude: savedLocation.latitude
        });

        const markerSymbol = new SimpleMarkerSymbol({
          color: [98, 168, 0],
          size: '12px',
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        });

        const deviceGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol
        });

        graphicsLayer.add(deviceGraphic);
        
        // Pan to the saved location
        mapView.goTo({
          center: [savedLocation.longitude, savedLocation.latitude],
          zoom: 12
        });
      }
    } catch (err) {
      console.error('Error updating map:', err);
      setError('Failed to update map visualization');
    }
  }, [mapView, graphicsLayer, deviceData, selectedDevice, deviceLocations, loading, showTemperature, showMoisture, showNutrients]);

  // Function to render map with device data
  const renderMapWithData = (data: DeviceData) => {
    if (!graphicsLayer) return;
    
    // Create device marker
    const point = new Point({
      longitude: data.longitude,
      latitude: data.latitude
    });

    const markerSymbol = new SimpleMarkerSymbol({
      color: [98, 168, 0],
      size: '12px',
      outline: {
        color: [255, 255, 255],
        width: 2
      }
    });

    const deviceGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol
    });

    graphicsLayer.add(deviceGraphic);

    // Add indicators if enabled
    if (showTemperature) {
      const tempRadius = data.temperature * 2;
      const tempSymbol = new SimpleFillSymbol({
        color: [255, 0, 0, 0.2],
        outline: {
          color: [255, 0, 0, 0.5],
          width: 1
        }
      });
      
      const centerPoint = new Point({
        longitude: data.longitude,
        latitude: data.latitude
      });
      
      const tempGraphic = new Graphic({
        geometry: {
          type: "polygon",
          rings: generateCircle(centerPoint, tempRadius)
        },
        symbol: tempSymbol
      });
      
      graphicsLayer.add(tempGraphic);
    }
    
    if (showMoisture) {
      const moistureRadius = data.soil_moisture * 5;
      const moistureSymbol = new SimpleFillSymbol({
        color: [0, 0, 255, 0.2],
        outline: {
          color: [0, 0, 255, 0.5],
          width: 1
        }
      });
      
      const centerPoint = new Point({
        longitude: data.longitude,
        latitude: data.latitude
      });
      
      const moistureGraphic = new Graphic({
        geometry: {
          type: "polygon",
          rings: generateCircle(centerPoint, moistureRadius)
        },
        symbol: moistureSymbol
      });
      
      graphicsLayer.add(moistureGraphic);
    }
    
    if (showNutrients) {
      const nutrientRadius = data.nutrient_level * 3;
      const nutrientSymbol = new SimpleFillSymbol({
        color: [0, 255, 0, 0.2],
        outline: {
          color: [0, 255, 0, 0.5],
          width: 1
        }
      });
      
      const centerPoint = new Point({
        longitude: data.longitude,
        latitude: data.latitude
      });
      
      const nutrientGraphic = new Graphic({
        geometry: {
          type: "polygon",
          rings: generateCircle(centerPoint, nutrientRadius)
        },
        symbol: nutrientSymbol
      });
      
      graphicsLayer.add(nutrientGraphic);
    }
  };

  // Update the generateCircle function to return the correct type and handle null checks
  const generateCircle = (center: Point, radius: number): number[][][] => {
    const points = 64;
    const coords: number[][] = [];
    
    // Check if center coordinates are valid
    if (center.longitude == null || center.latitude == null) {
      console.warn('Invalid center coordinates for circle generation');
      return [[[0, 0], [0, 0], [0, 0]]]; // Return a minimal valid polygon
    }
    
    for (let i = 0; i < points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const x = center.longitude + radius * Math.cos(angle);
      const y = center.latitude + radius * Math.sin(angle);
      coords.push([x, y]);
    }
    
    // Close the circle by adding the first point again
    coords.push(coords[0]);
    
    // Return as array of rings (required for polygon geometry)
    return [coords];
  };

  // Update the device click handler
  const handleDeviceClick = (device: Device) => {
    if (selectedDevice?.id === device.id) {
      setSelectedDevice(null); // Unselect if already selected
    } else {
      try {
        // Cancel any ongoing request
        if (currentRequestRef.current) {
          currentRequestRef.current.abort();
          currentRequestRef.current = null;
        }
        
        setSelectedDevice(device); // Select the new device
        
        // Create a new abort controller for this request
        const controller = new AbortController();
        currentRequestRef.current = controller;
        
        // Start a new request
        fetchDeviceData(device.id.toString());
      } catch (err) {
        console.error('Error handling device click:', err);
        setError('Failed to select device');
      }
    }
  };

  // Update the device data when a device is selected
  useEffect(() => {
    if (!selectedDevice) {
      // If no device is selected, show all saved locations on the map
      if (mapView && graphicsLayer && !loading) {
        showAllDeviceLocations();
      }
      return;
    }
    
    // Create a new abort controller for this effect
    const controller = new AbortController();
    currentRequestRef.current = controller;
    
    // Fetch data for the selected device
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.serial_number);
    }
    
    // Cleanup function to abort request when component unmounts or selectedDevice changes
    return () => {
      controller.abort();
    };
  }, [selectedDevice, deviceLocations, mapView, graphicsLayer, loading]);

  return (
    <div className="container-fluid p-0 h-100">
      <div className="row h-100 g-0">
        {/* Left sidebar */}
        <div className="col-md-3 h-100" style={{ 
          background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.03)',
          overflow: 'auto',
          padding: '1.75rem 1.5rem'
        }}>
          <div className="mb-4">
            <h4 className="mb-4" style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600',
              color: '#2c3e50',
              letterSpacing: '-0.01em',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <i className="fas fa-map-marker-alt me-2" style={{ color: '#3498db' }}></i>
              {t('fieldDevices')}
            </h4>
            
            {loading && (
              <div className="d-flex align-items-center py-2 px-3 rounded-3" style={{ 
                background: 'rgba(52, 152, 219, 0.05)', 
                border: '1px solid rgba(52, 152, 219, 0.1)'
              }}>
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: '#3498db' }}>
                  <span className="visually-hidden">{t('loading')}...</span>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#3498db' }}>{t('loading')}...</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3 rounded-3" style={{ 
                fontSize: '0.875rem',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                color: '#e74c3c',
                border: '1px solid rgba(231, 76, 60, 0.2)'
              }}>
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
            
            {/* Device list */}
            <div className="list-group mb-4" style={{ 
              gap: '0.75rem',
              border: 'none'
            }}>
              {devices.map(device => (
                <button
                  key={device.id}
                  className={`list-group-item list-group-item-action border rounded-3 shadow-sm ${
                    selectedDevice?.id === device.id ? 'active' : ''
                  }`}
                  onClick={() => handleDeviceClick(device)}
                  style={{
                    transition: 'all 0.2s ease',
                    border: selectedDevice?.id === device.id 
                      ? 'none' 
                      : '1px solid rgba(0,0,0,0.05)',
                    padding: '1rem',
                    background: selectedDevice?.id === device.id 
                      ? 'linear-gradient(135deg, #3498db, #2980b9)' 
                      : 'white',
                    color: selectedDevice?.id === device.id 
                      ? 'white' 
                      : '#2c3e50'
                  }}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <h6 className="mb-1" style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      letterSpacing: '-0.01em'
                    }}>
                      {device.name || `Device #${device.id}`}
                    </h6>
                    <span className="badge rounded-pill" style={{ 
                      fontSize: '0.7rem',
                      padding: '0.35em 0.65em',
                      background: selectedDevice?.id === device.id 
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'rgba(52, 152, 219, 0.1)', 
                      color: selectedDevice?.id === device.id 
                        ? 'white'
                        : '#3498db',
                      backdropFilter: 'blur(2px)'
                    }}>
                      {device.device_type}
                    </span>
                  </div>
                  <div className="d-flex align-items-center mt-2" style={{ 
                    fontSize: '0.85rem', 
                    opacity: selectedDevice?.id === device.id ? '0.9' : '0.7'
                  }}>
                    <i className="fas fa-fingerprint me-2" style={{ fontSize: '0.8rem' }}></i>
                    <span>SN: {device.serial_number}</span>
                  </div>
                </button>
              ))}
              
              {devices.length === 0 && !loading && (
                <div className="text-center p-4 rounded-3" style={{
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px dashed rgba(0,0,0,0.1)'
                }}>
                  <i className="fas fa-satellite-dish fa-2x mb-3" style={{ color: 'rgba(0,0,0,0.2)' }}></i>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {t('noDevicesFound')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Layer controls */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{
              background: 'white'
            }}>
              <div className="card-header" style={{ 
                background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                padding: '1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                <i className="fas fa-layer-group me-2" style={{ color: '#3498db' }}></i>
                {t('mapLayers')}
              </div>
              <div className="card-body" style={{ padding: '1.25rem' }}>
                <div className="mb-3">
                  <div className="form-check d-flex align-items-center mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="showTemperature"
                      checked={showTemperature}
                      onChange={() => setShowTemperature(!showTemperature)}
                      style={{ 
                        cursor: 'pointer',
                        width: '1.1rem',
                        height: '1.1rem',
                        marginTop: '0',
                        borderColor: 'rgba(0,0,0,0.15)'
                      }}
                    />
                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="showTemperature" style={{ 
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      <div className="d-inline-block me-2" style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(231, 76, 60, 0.2)',
                        border: '2px solid rgba(231, 76, 60, 0.7)'
                      }}></div>
                      {t('showTemperature')}
                    </label>
                  </div>
                  
                  <div className="form-check d-flex align-items-center mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="showMoisture"
                      checked={showMoisture}
                      onChange={() => setShowMoisture(!showMoisture)}
                      style={{ 
                        cursor: 'pointer',
                        width: '1.1rem',
                        height: '1.1rem',
                        marginTop: '0',
                        borderColor: 'rgba(0,0,0,0.15)'
                      }}
                    />
                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="showMoisture" style={{ 
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      <div className="d-inline-block me-2" style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(52, 152, 219, 0.2)',
                        border: '2px solid rgba(52, 152, 219, 0.7)'
                      }}></div>
                      {t('showMoisture')}
                    </label>
                  </div>
                  
                  <div className="form-check d-flex align-items-center">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="showNutrients"
                      checked={showNutrients}
                      onChange={() => setShowNutrients(!showNutrients)}
                      style={{ 
                        cursor: 'pointer',
                        width: '1.1rem',
                        height: '1.1rem',
                        marginTop: '0',
                        borderColor: 'rgba(0,0,0,0.15)'
                      }}
                    />
                    <label className="form-check-label ms-2 d-flex align-items-center" htmlFor="showNutrients" style={{ 
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      color: '#2c3e50'
                    }}>
                      <div className="d-inline-block me-2" style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(46, 204, 113, 0.2)',
                        border: '2px solid rgba(46, 204, 113, 0.7)'
                      }}></div>
                      {t('showNutrients')}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map container */}
        <div className="col-md-9 h-100 position-relative">
          <div id="mapDiv" className="w-100 h-100" ref={mapDiv}></div>
          
          {/* Loading overlay */}
          {loading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{
              background: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1000
            }}>
              <div className="d-flex flex-column align-items-center">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">{t('loading')}...</span>
                </div>
                <span style={{ color: '#3498db', fontWeight: '500' }}>{t('loading')}...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for popups and hover effects */}
      <style>
        {`
          .device-popup {
            padding: 12px;
            min-width: 220px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          
          .device-popup h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          
          .popup-table {
            width: 100%;
            margin-bottom: 12px;
            border-collapse: separate;
            border-spacing: 0 6px;
          }
          
          .popup-table th {
            text-align: left;
            padding-right: 12px;
            color: #7f8c8d;
            font-weight: 500;
            font-size: 0.85rem;
            vertical-align: top;
          }
          
          .popup-table td {
            font-weight: 600;
            color: #2c3e50;
            font-size: 0.9rem;
          }
          
          .popup-date {
            font-size: 0.75rem;
            color: #95a5a6;
            text-align: right;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 1px solid #eee;
          }

          .list-group-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
          }

          .form-check-input:checked {
            background-color: #3498db;
            border-color: #3498db;
          }

          .form-check-input:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
          }
          
          /* Customize the esri popup */
          .esri-popup__main-container {
            border-radius: 8px !important;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
          }
          
          .esri-popup__header {
            background: linear-gradient(135deg, #3498db, #2980b9) !important;
          }
          
          .esri-popup__header-title {
            color: white !important;
          }
          
          .esri-popup__button {
            color: white !important;
          }
          
          .esri-popup__content {
            padding: 0 !important;
          }
        `}
      </style>
    </div>
  );
};

export default MapPage; 