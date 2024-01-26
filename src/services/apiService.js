const axios = require('axios');
const utils = require('./utils');

const getInatkeModelPrediction = async (user_id) => {
  const apiURL = `${process.env.API_ML_SERVICE}/predictor/users/${user_id}/intake-model-prediction/`;
  try {
    const response = await axios.get(apiURL);
    const predictions = response.data.predictions;
    console.log(predictions);

    const getFoodDetalPromise = predictions.map(food_id => utils.getFoodDetailById(food_id));
    const foodDeatil = await Promise.all(getFoodDetalPromise);
    console.log(foodDeatil);

    return {success: true, predictions: foodDeatil};     
  } catch (error) {
    console.error('Error in getting food prediction by model!', error);
    throw error;
  }
};

module.exports = {
  getInatkeModelPrediction
};