import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { io } from 'socket.io-client';

const SensorContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    mq2Raw: 0,
    mq2Ppm: 0,
    temperature: 0,
    humidity: 0,
    timestamp: null,
    socketConnected: false,
    arduinoConnected: false,
    arduinoEnabled: false,
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setSensorData((prev) => ({ ...prev, socketConnected: true }));
    });

    socket.on('disconnect', () => {
      setSensorData((prev) => ({ ...prev, socketConnected: false, arduinoConnected: false }));
    });

    socket.on('arduinoStatus', (data) => {
      setSensorData((prev) => ({ 
        ...prev, 
        arduinoEnabled: data.isArduinoEnabled,
        arduinoConnected: data.isArduinoAlive
      }));
    });

    socket.on('sensorUpdate', (data) => {
      setSensorData((prev) => ({ 
        ...data, 
        socketConnected: true, 
        arduinoEnabled: prev.arduinoEnabled,
        arduinoConnected: true 
      }));
    });

    // Fetch initial status
    fetch(`${SOCKET_URL}/api/sensor/status`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSensorData(prev => ({ 
            ...prev, 
            arduinoEnabled: data.isArduinoEnabled,
            arduinoConnected: data.isArduinoAlive 
          }));
        }
      })
      .catch(() => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SensorContext.Provider value={sensorData}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensorContext = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorContext must be used within a SensorProvider');
  }
  return context;
};
