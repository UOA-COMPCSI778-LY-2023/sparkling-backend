const mongoose = require('mongoose');

const packagedFoodSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  product_name: {
    type: String,
    required: true
  },
  category: { 
    type: String,
    required: true
  },
  brand: { 
    type: String,
    required: true
  },
  quantity:{
    type: String,
  },
  price:{
    type: Number,
  },
  img_url: { 
    type: String, 
    required: false
  },
  serving_size: { 
    type: Number,
    required: true
  },
  serving_unit: { 
    type: String,
    required: true
  },
  serving_qty: { 
    type: Number,
    required: true
  },
  serving_qty_unit: { 
    type: String,
    required: true
  },
  serving_per_pack: { 
    type: Number,
    required: true
  },
  nutriments: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const PackagedFood = mongoose.model('PackagedFood', packagedFoodSchema);
module.exports = PackagedFood;
