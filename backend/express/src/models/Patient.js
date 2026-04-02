const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['남성', '여성', '기타'], default: '남성' },
    roomNumber: { type: String },
    medicalRecordNumber: { type: String },
    status: { type: String, enum: ['normal', 'pending', 'urgent'], default: 'normal' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symptoms: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
