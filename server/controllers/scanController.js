import fs from 'fs';
import Scan from '../models/Scan.js';
import SensorLog from '../models/SensorLog.js';
import { analyzeProduceImage } from '../services/geminiService.js';
import { computeFreshScore } from '../services/freshScoreEngine.js';

// ── POST /api/scan ────────────────────────────────────────────────────────────
export async function createScan(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const imagePath = req.file.path;

  try {
    // 1. Fetch latest sensor reading (or use fallback zeros)
    const latestSensor = await SensorLog.findOne().sort({ createdAt: -1 }).lean();
    const sensorData = latestSensor
      ? {
          mq2Ppm: latestSensor.mq2Ppm,
          temperature: latestSensor.temperature,
          humidity: latestSensor.humidity,
        }
      : { mq2Ppm: 0, temperature: 25, humidity: 50 };

    // 2. Call Gemini Vision API
    const geminiResult = await analyzeProduceImage(imagePath, sensorData);

    // 3. Compute FreshScore (fusion)
    const { freshScore, category, shelfLifeDays } = computeFreshScore(
      geminiResult.overallVisualScore ?? 50,
      sensorData,
      geminiResult.estimatedShelfLifeDays ?? 0
    );

    // 4. Save scan to MongoDB
    // Set expiration: Min 1 day buffer to keep 0-day (spoiled) items in history briefly
    const expiresAt = new Date(Date.now() + Math.max(1, shelfLifeDays) * 24 * 60 * 60 * 1000);

    const scan = await Scan.create({
      user: req.user._id,
      imagePath,
      produceType: geminiResult.produceType || 'Unknown',
      freshScore,
      category,
      shelfLifeDays,
      geminiAnalysis: {
        colorScore: geminiResult.colorScore,
        textureScore: geminiResult.textureScore,
        defectsDetected: geminiResult.defectsDetected || [],
        overallVisualScore: geminiResult.overallVisualScore,
        freshnessSummary: geminiResult.freshnessSummary,
      },
      sensorSnapshot: sensorData,
      recommendations: geminiResult.storageRecommendations || [],
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      scanId: scan._id,
      produceType: scan.produceType,
      freshScore: scan.freshScore,
      category: scan.category,
      shelfLifeDays: scan.shelfLifeDays,
      geminiAnalysis: scan.geminiAnalysis,
      sensorSnapshot: scan.sensorSnapshot,
      recommendations: scan.recommendations,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    console.error('[scanController] createScan:', error);
    return res.status(500).json({ error: error.message || 'Scan failed' });
  }
}

// ── GET /api/scans ────────────────────────────────────────────────────────────
export async function getScans(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      Scan.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Scan.countDocuments({ user: req.user._id }),
    ]);

    return res.json({
      scans,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[scanController] getScans:', error);
    return res.status(500).json({ error: 'Failed to fetch scans' });
  }
}

// ── GET /api/scans/:id ────────────────────────────────────────────────────────
export async function getScanById(req, res) {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    return res.json(scan);
  } catch (error) {
    console.error('[scanController] getScanById:', error);
    return res.status(500).json({ error: 'Failed to fetch scan' });
  }
}
