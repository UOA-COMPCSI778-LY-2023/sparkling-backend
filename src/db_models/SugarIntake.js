const mongoose = require('mongoose');

const sugarIntakeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date, 
    default: Date.now
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
