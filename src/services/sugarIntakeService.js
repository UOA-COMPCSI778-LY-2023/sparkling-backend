
const mongoose = require('mongoose');
const PackagedFood = require('../db_models/PackagedFood');
const SugarIntake = require('../db_models/SugarIntake');
const User = require('../db_models/User');
const Utils = require('./utils');
const { MongoCursorInUseError } = require('mongodb');
const moment = require('moment-timezone');
const utils = require('./utils');

class SugarIntakeService {
  
  async getDailyIntake(username) {
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      const dateNZ = moment().tz("Pacific/Auckland").startOf('day').format();
      const totalSugar = await Utils.returnSugarIntakeByDay(user_id, dateNZ);
      return {success: true, sugar: totalSugar};     
    }catch(error){
      console.error('Error in getting suagr intake today!', error);
      throw error;
    }
  }

  async getLastNDaysIntake(username, days) {
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      let dailyIntakes = [];

      for(let i=0; i<days; i++){
        let dayNZ = moment().tz("Pacific/Auckland").startOf('day').subtract(i, 'days').format();
        const sugar = await Utils.returnSugarIntakeByDay(user_id, dayNZ);
        dailyIntakes.push({date: dayNZ, sugarIntake: sugar});
      };
      return {success: true, dailyIntakes};
    }catch(error){
      console.error('Error in getting suagr intake report!', error);
      throw error;
    }
}  

  async addSugarIntake(username, code, serving_count){
    try{
      const user = await User.findOne({username: username});
      const food = await PackagedFood.findOne({code: code});
      if(!user||!food){
        return {success: false, message: 'User or food does not exist!'}
      };
      const food_id = await Utils.getFoodIdbyCode(code);
      const user_id = await Utils.getUserIdbyName(username);
      const sugar = await Utils.calculateIntakeSugar(food_id, serving_count);

      const sugarIntake = new SugarIntake({
        user: user_id,
        sugar: sugar,
        food: food_id,
        serving_count: serving_count,
      });
      await sugarIntake.save();
      return{success: true}
    }catch(error){
      console.error('Error in adding suagr intake', error);
      throw error;
    }
  }
  async getIntakesListLastWeek(username){
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      } 
      const user_id = user._id;
      const now = moment().tz("Pacific/Auckland").format();
      const startOfDay = moment(now).subtract(8, 'days').startOf('day').format();
      const endOfDay = moment(now).subtract(1, 'day').endOf('day').format();

      const intakeList = await SugarIntake.aggregate([
        {$match: {user: user_id, date: { $gte: startOfDay, $lt: endOfDay }}},
        {$group: {_id: '$food', frequency: {$sum: 1}}},
        {$sort: {frequency: -1}},
      ]);

      const result = await SugarIntake.populate(intakeList, {path: '_id', model: 'PackagedFood'});
      const finalResult = result.map(item => ({
        food: item._id,
        frequency: item.frequency
      }));
      return{success: true, list: finalResult}
    }catch(error){
      console.error('Error in getting weekly intake list!', error);
      throw error;
    }
  }

  async getIntakesListToday(username){
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      } 
      const user_id = user._id;
      
      const startOfDay = moment().tz("Pacific/Auckland").startOf('day').format();
      const endOfDay = moment().tz("Pacific/Auckland").endOf('day').format();

      const list = await SugarIntake.find({
        user: user_id, 
        date: { $gte: startOfDay, $lt: endOfDay }
      }).populate('food');

      const newList = list.map(item => ({
        ...item.toObject(),
        food: item.food.code  
      }));
      return{success: true, list: newList}
    }catch(error){
      console.error('Error in getting intake list today!', error);
      throw error;
    }
  }

  async removeSugarIntake(username, record_id){
    try{
      const user = await User.findOne({username: username});
      const record = await SugarIntake.findOne({_id: record_id});
      if(!user||!record){
        return {success: false, message: 'User or record does not exist!'}
      }
      await SugarIntake.deleteOne({ _id: record_id });
      return{success: true};
    }catch(error){
      console.error('Error in removing suagr intake', error);
      throw error;
    }
  }


//Plan_1: Prediction by sort all intake records
  async foodPrediction(username){
    try{    
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      const result = await utils.getTopInatkeFoodIds(user_id);
      if(result.success === false){
        return {success: false, message: result.message };
      }else{
        const foodAndServingPromise = result.foodlist.map(food_id => utils.getMostFrequentServingCount(user_id,food_id));
        const recommendFoodAndServingCount = await Promise.all(foodAndServingPromise);
        return {success: true, predictions: recommendFoodAndServingCount};
    }
    }catch(error){
      console.error('Error in getting food prediction!', error);
      throw error;
    }
  }

  //Plan_2: Prediction by sort time interval intake records - based on(3 hours interval, 8 intervals one day)
  async foodPrediction_byTime(username){
    try{    
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      const foodList_intervals = await utils.getTopIntakesList_byTimeIntervals(user_id);
      const foodListCurrent= await utils.getTopIntakeFoodIds_CurrentInterval(foodList_intervals);

      if(foodListCurrent.length > 0){
        const foodAndServingPromise = foodListCurrent.map(food_id => utils.getMostFrequentServingCount(user_id,food_id));
        const recommendFoodAndServingCount = await Promise.all(foodAndServingPromise);
        return {success: true, predictions: recommendFoodAndServingCount};
      }else{
          return { success: false, message: "No food data available for this time interval." }
      }
    }catch(error){
      console.error('Error in getting food prediction!', error);
      throw error;
    }
  }

}

module.exports = new SugarIntakeService();
