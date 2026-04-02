const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema(
  {
    condition: String,
    probability: Number,
    description: String,
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    confidence: Number,
    findings: [findingSchema],
    recommendations: [String],
    aiNotes: String,
    gradcamPath: String,
    gradcamPlusPath: String,
    layercamPath: String,
  },
  { _id: false }
);

const diagnosisSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String },
    aiAnalysis: aiAnalysisSchema,
    review: {
      summary: String,
      notes: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
