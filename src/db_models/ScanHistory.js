const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackagedFood',
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
});

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);
module.exports = ScanHistory;
