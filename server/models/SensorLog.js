import mongoose from 'mongoose';

const sensorLogSchema = new mongoose.Schema(
  {
    mq2Raw: {
      type: Number,
      required: true,
      min: 0,
      max: 1023,
    },
    mq2Ppm: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    deviceId: {
      type: String,
      default: 'arduino-01',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Index for fast "latest reading" queries
sensorLogSchema.index({ createdAt: -1 });

export default mongoose.model('SensorLog', sensorLogSchema);
