const axios = require('axios');
const utils = require('./utils');

const getInatkeModelPrediction = async (user_id) => {
  const apiURL = `${process.env.API_ML_SERVICE}/predictor/users/${user_id}/intake-model-prediction/`;
  try {
    const response = await axios.get(apiURL);
    const predictions = response.data.predictions;
    // console.log(predictions);
    if(predictions.length > 0){
      const foodAndServingPromise = predictions.map(food_id => utils.getMostFrequentServingCount(user_id,food_id));
      const foodDeatil = await Promise.all(foodAndServingPromise);
      // console.log(foodDeatil);
      return {success: true, predictions: foodDeatil};  
    }else{
      return { success: false, message: "No food data available for prediction" }
    }    
  } catch (error) {
    console.error('Error in getting food prediction by model!', error);
    throw error;
  }
};

module.exports = {
  getInatkeModelPrediction
};