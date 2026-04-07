import SensorLog from '../models/SensorLog.js';
import { io } from '../index.js';

// In-memory state for Arduino connectivity (default: disabled)
let isArduinoEnabled = false;
let lastActivity = null;

// ── GET /api/sensor/status ──────────────────────────────────────────────────
export const getArduinoStatus = async (req, res) => {
  // Check if Arduino has sent data in the last 15 seconds
  const isArduinoAlive = lastActivity && (Date.now() - lastActivity < 15000);
  res.status(200).json({ success: true, isArduinoEnabled, isArduinoAlive });
};

// Internal aliveness checker
if (typeof global !== 'undefined') {
  setInterval(() => {
    if (lastActivity && (Date.now() - lastActivity > 15000)) {
       // Only emit if it was just recently alive
       lastActivity = null; 
       io.emit('arduinoStatus', { isArduinoEnabled, isArduinoAlive: false });
    }
  }, 5000);
}

// ── POST /api/sensor/toggle ─────────────────────────────────────────────────
export const toggleArduino = async (req, res) => {
  isArduinoEnabled = !isArduinoEnabled;
  
  // Broadcast the new status to all clients
  io.emit('arduinoStatus', { isArduinoEnabled });
  
  res.status(200).json({ success: true, isArduinoEnabled });
};

// ── POST /api/sensor ─────────────────────────────────────────────────────────
// Called by Arduino every 5 seconds
export async function receiveSensorData(req, res) {
  try {
    if (!isArduinoEnabled) {
      return res.status(503).json({ success: false, message: 'Arduino connection disabled on server.' });
    }

    // Optional device key auth
    const deviceKey = req.headers['x-device-key'];
    if (
      process.env.DEVICE_SECRET_KEY &&
      deviceKey !== process.env.DEVICE_SECRET_KEY
    ) {
      return res.status(401).json({ error: 'Unauthorized device' });
    }

    const { mq2Raw, mq2Ppm, temperature, humidity, deviceId } = req.body;

    if (mq2Raw === undefined || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'Missing required sensor fields' });
    }

    const log = await SensorLog.create({
      mq2Raw,
      mq2Ppm: mq2Ppm ?? 0,
      temperature,
      humidity,
      deviceId: deviceId || 'arduino-01',
    });

    // Broadcast to all connected Socket.IO clients (real-time dashboard)
    io.emit('sensorUpdate', {
      mq2Raw: log.mq2Raw,
      mq2Ppm: log.mq2Ppm,
      temperature: log.temperature,
      humidity: log.humidity,
      deviceId: log.deviceId,
      timestamp: log.createdAt,
    });
    
    // Update real-time connection status
    lastActivity = Date.now();
    io.emit('arduinoStatus', { isArduinoEnabled, isArduinoAlive: true });

    return res.status(201).json({ success: true, id: log._id });
  } catch (error) {
    console.error('[sensorController] receiveSensorData:', error);
    return res.status(500).json({ error: 'Failed to save sensor data' });
  }
}

// ── GET /api/sensor/latest ───────────────────────────────────────────────────
export async function getLatestSensor(req, res) {
  try {
    const latest = await SensorLog.findOne().sort({ createdAt: -1 }).lean();
    if (!latest) {
      // Return zeros if no Arduino has posted yet
      return res.json({
        mq2Raw: 0,
        mq2Ppm: 0,
        temperature: 0,
        humidity: 0,
        deviceId: 'none',
        timestamp: null,
      });
    }
    return res.json(latest);
  } catch (error) {
    console.error('[sensorController] getLatestSensor:', error);
    return res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
}

// ── GET /api/sensor/history ──────────────────────────────────────────────────
export async function getSensorHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await SensorLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json(logs.reverse()); // oldest-first for chart rendering
  } catch (error) {
    console.error('[sensorController] getSensorHistory:', error);
    return res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
}
