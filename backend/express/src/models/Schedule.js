const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['surgery', 'appointment', 'xray', 'meeting', 'other'],
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: function() {
        return this.type !== 'xray' && this.type !== 'meeting' && this.type !== 'other';
      }
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'in-progress'],
      default: 'scheduled'
    },
    statusText: {
      type: String,
      default: '예정'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    linkedCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diagnosis',
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// 인덱스 추가 (조회 성능 향상)
scheduleSchema.index({ doctorId: 1, startDateTime: 1 });
scheduleSchema.index({ patientId: 1 });
scheduleSchema.index({ startDateTime: 1, endDateTime: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);








