/**
 * FreshScore Fusion Engine
 * ────────────────────────
 * Combines Gemini visual analysis with Arduino sensor data
 * to produce a unified freshness score (0–100).
 *
 * Formula:
 *   FreshScore = (0.60 × visualScore)
 *              + (0.25 × gasFactor)
 *              + (0.15 × envFactor)
 */

const WEIGHTS = {
  visual: 0.60,
  gas: 0.25,
  env: 0.15,
};

// Max PPM to consider — beyond this the produce is heavily spoiled
const MAX_PPM = 200;

// Ideal storage conditions (baseline reference)
const IDEAL_TEMP = 10;   // °C  (cool storage)
const IDEAL_HUMIDITY = 55; // %

/**
 * Converts raw MQ-2 ADC reading (0–1023) to estimated PPM.
 * Uses the 4-band linear calibration from the spec.
 */
export function rawToPpm(rawAdc) {
  if (rawAdc <= 300) return (rawAdc / 300) * 10;
  if (rawAdc <= 600) return 10 + ((rawAdc - 300) / 300) * 40;
  if (rawAdc <= 800) return 50 + ((rawAdc - 600) / 200) * 100;
  return 150 + ((rawAdc - 800) / 223) * 150;
}

/**
 * Converts MQ-2 PPM to a 0–100 factor (inverted — higher PPM = lower score).
 */
function gasFactor(mq2Ppm) {
  const capped = Math.min(mq2Ppm, MAX_PPM);
  return 100 - (capped / MAX_PPM) * 100;
}

/**
 * Converts temperature + humidity deviation to a 0–100 env factor.
 * Perfect conditions → 100; extreme deviation → near 0.
 */
function envFactor(temperature, humidity) {
  const tempDev = Math.abs(temperature - IDEAL_TEMP);
  const humidDev = Math.abs(humidity - IDEAL_HUMIDITY);

  // Each deviation unit reduces score: temp by 2pts/°C, humidity by 1pt/%
  const penalty = Math.min(tempDev * 2 + humidDev * 1, 100);
  return 100 - penalty;
}

/**
 * Maps a FreshScore to a category label.
 */
export function scoreToCategory(score) {
  if (score >= 80) return 'Fresh';
  if (score >= 50) return 'Moderate';
  return 'Spoiled';
}

/**
 * Main fusion function.
 * @param {number} visualScore - Gemini overallVisualScore (0–100)
 * @param {object} sensorData  - { mq2Ppm, temperature, humidity }
 * @param {number} shelfLifeDays - From Gemini estimate
 * @returns {{ freshScore, category, shelfLifeDays }}
 */
export function computeFreshScore(visualScore, sensorData, shelfLifeDays) {
  const { mq2Ppm = 0, temperature = 25, humidity = 50 } = sensorData;

  const gas = gasFactor(mq2Ppm);
  const env = envFactor(temperature, humidity);

  const raw =
    WEIGHTS.visual * visualScore +
    WEIGHTS.gas * gas +
    WEIGHTS.env * env;

  const freshScore = Math.round(Math.min(Math.max(raw, 0), 100));
  const category = scoreToCategory(freshScore);

  // Adjust shelf life down if sensors show bad conditions
  const sensorPenaltyDays = mq2Ppm > 50 || temperature > 35 ? -1 : 0;
  const adjustedShelfLife = Math.max(0, shelfLifeDays + sensorPenaltyDays);

  return { freshScore, category, shelfLifeDays: adjustedShelfLife };
}
