import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Converts a local image file to a Gemini-compatible Part object.
 */
function imageToGenerativePart(filePath, mimeType) {
  const data = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: data.toString('base64'),
      mimeType,
    },
  };
}

/**
 * Determines the MIME type from the file extension.
 */
function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const mimeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return mimeMap[ext] || 'image/jpeg';
}

/**
 * Calls Gemini Vision API with the produce image and sensor context.
 * @param {string} imagePath - Local path to the uploaded image
 * @param {object} sensorData - { mq2Ppm, temperature, humidity }
 * @returns {object} Parsed Gemini JSON response
 */
export async function analyzeProduceImage(imagePath, sensorData) {
  const { mq2Ppm = 0, temperature = 25, humidity = 50 } = sensorData;

  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are an expert food scientist specializing in produce freshness assessment.

Analyze the fruit or vegetable in the provided image carefully.

Environmental context from IoT sensors at time of scanning:
- Gas sensor (MQ-2): ${mq2Ppm} ppm (VOCs/ammonia — higher = more spoilage gases detected)
- Temperature: ${temperature} °C
- Relative Humidity: ${humidity} %

Assess the visual freshness based on color, texture, surface defects, mold, wilting, bruising, and overall appearance.

Return ONLY valid JSON — no markdown, no explanation, no code fences:
{
  "produceType": "string (name of the fruit or vegetable)",
  "colorScore": 0-100,
  "textureScore": 0-100,
  "defectsDetected": ["string"],
  "overallVisualScore": 0-100,
  "estimatedShelfLifeDays": number,
  "freshnessSummary": "string (1 concise sentence describing freshness)",
  "storageRecommendations": ["string"]
}`;

  const imagePart = imageToGenerativePart(imagePath, getMimeType(imagePath));

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // Strip any accidental markdown fences
  const cleanJson = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleanJson);
  } catch {
    console.error('[Gemini] Failed to parse response JSON:', text);
    throw new Error('Gemini returned invalid JSON. Raw: ' + text.slice(0, 300));
  }
}
