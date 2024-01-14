const mongoose = require('mongoose');
const moment = require('moment-timezone');

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
    type: String,
    default: () => moment().tz("Pacific/Auckland").format()
  },
});

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);
module.exports = ScanHistory;
