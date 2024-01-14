const mongoose = require('mongoose');
const moment = require('moment-timezone');

const sugarIntakeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: String,
    default: () => moment().tz("Pacific/Auckland").format()
  },
  sugar: {
    type: Number, 
    required: true
  },
  food: {    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackagedFood',
    required: true
  },
  serving_count: {
    type: Number,
    required: true
  },
});

const SugarIntake = mongoose.model('SugarIntake', sugarIntakeSchema);
module.exports = SugarIntake;
