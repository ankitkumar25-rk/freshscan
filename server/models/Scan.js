import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    produceType: {
      type: String,
      default: 'Unknown',
    },
    freshScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      enum: ['Fresh', 'Moderate', 'Spoiled'],
      required: true,
    },
    shelfLifeDays: {
      type: Number,
      default: 0,
    },
    geminiAnalysis: {
      colorScore: Number,
      textureScore: Number,
      defectsDetected: [String],
      overallVisualScore: Number,
      freshnessSummary: String,
    },
    sensorSnapshot: {
      mq2Ppm: Number,
      temperature: Number,
      humidity: Number,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      // Automatically deletes the document when this date is reached
    },
  },
  {
    timestamps: true,
  }
);

// Index for paginated history queries
scanSchema.index({ createdAt: -1 });

// TTL Index for auto-deletion of expired produce records
scanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Scan', scanSchema);
