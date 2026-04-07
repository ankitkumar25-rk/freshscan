import express from 'express';
import {
  receiveSensorData,
  getLatestSensor,
  getSensorHistory,
  getArduinoStatus,
  toggleArduino,
} from '../controllers/sensorController.js';

const router = express.Router();

router.get('/sensor/status', getArduinoStatus);
router.post('/sensor/toggle', toggleArduino);
router.post('/sensor', receiveSensorData);
router.get('/sensor/latest', getLatestSensor);
router.get('/sensor/history', getSensorHistory);

export default router;
