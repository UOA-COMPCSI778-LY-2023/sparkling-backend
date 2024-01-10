const mongoose = require('mongoose');

const customFoodNutritionSchema = new mongoose.Schema({
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
  nutriments: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
});

const CustomFoodNutrition = mongoose.model('CustomFoodNutrition', customFoodNutritionSchema);

module.exports = CustomFoodNutrition;
