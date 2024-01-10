
const mongoose = require('mongoose');
const PackagedFood = require('../db_models/PackagedFood');
const SugarIntake = require('../db_models/SugarIntake');
const User = require('../db_models/User');
const Utils = require('./utils');

class SugarIntakeService {
  
  async getDailyIntake(username) {
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      const date = new Date();
      const totalSugar = await Utils.returnSugarIntakeByDay(user_id, date);
      return {success: true, sugar: totalSugar};     
    }catch(error){
      console.error('Error in getting suagr intake today!', error);
      throw error;
    }
  }

  async getLastNDaysIntake(username, date, days) {
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      let dailyIntakes = [];
      for(let i=0; i<days; i++){
        let day = new Date();
        day.setDate(day.getDate() - i);
        const sugar = await Utils.returnSugarIntakeByDay(user_id, day);
        dailyIntakes.push({date: day, sugarIntake: sugar});
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

  async getIntakesListToday(username){
    try{
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      } 
      const user_id = user._id;
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

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
      console.error('Error in adding suagr intake', error);
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


//Plan_1: Recommendation by sort
  async foodRecommendation(username){
    try{    
      const user = await User.findOne({username: username}).select('_id');
      if(!user){
        return {success: false, message: 'User does not exist!'}
      }
      const user_id = user._id;
      const foodList = await this.getTopInatkeFoodIds(user_id);
      const foodAndServingPromise = foodList.map(food_id => this.getMostFrequentServingCount(user_id,food_id));
      const recommendFoodAndServingCount = await Promise.all(foodAndServingPromise);
      if(recommendFoodAndServingCount.length==0){
        throw new Error('No availiable user intake hostory!');
      }
      return {success: true, recommendations: recommendFoodAndServingCount};
    }catch(error){
      console.error('Error in getMostFrequentServingCount', error);
      throw error;
    }
  }

  async getTopInatkeFoodIds(user_id){
    try{
      const result = await SugarIntake.aggregate([
        {$match: {user: new mongoose.Types.ObjectId(user_id)}},
        {$group: {_id: '$food', frequency: {$sum: 1}}},
        {$sort: {frequency: -1}},
        {$limit: 5},
        { $project: { _id: 1 } }
      ]);
      return result.map(item => item._id);
    }catch(error){
      console.error('Error in getTopFoodsByUser:', error);
      throw error;
    }
  }
  async getMostFrequentServingCount(user_id, food_id){
    try{
      const result = await SugarIntake.aggregate([
        {$match: {user: new mongoose.Types.ObjectId(user_id), food: new mongoose.Types.ObjectId(food_id)}},
        {$group: {_id: '$serving_count', frequency: {$sum: 1}}},
        {$sort: {frequency: -1}},
        {$limit: 1},
        { $project: { _id: 0, mostFrequentServingCount: '$_id', food: new mongoose.Types.ObjectId(food_id) } }
      ]);

      if (result.length === 0) {
        throw new Error('User and food record not exist!');
      }
      return {
        food_id: food_id,
        mostFrequentServingCount: result[0].mostFrequentServingCount
      };
    }catch(error){
      console.error('Error in getFoodServingCount', error);
      throw error;
    }
  }
}

module.exports = new SugarIntakeService();
