

const mongoose = require('mongoose');
const SugarIntake = require('../db_models/SugarIntake');
const PackagedFood = require('../db_models/PackagedFood');
const User = require('../db_models/User');
const moment = require('moment-timezone');

class Utils{
    async getUserIdbyName(username){
        try{
            const user = await User.findOne({username: username}).select('_id');
            if(!user){
            throw new Error('Username does not exist!');
            }
            return user._id;
        }catch(error){
            console.error('Error in getUserIdByUsername', error);
            throw error;
        }
    }
    async getFoodIdbyCode(code){
        try{
            const food = await PackagedFood.findOne({code: code}).select('_id');
            if(!food){
            throw new Error('Food code does not exist!');
            }
            return food._id;
        }catch(error){
            console.error('Error in getFoodIdbyCode', error);
            throw error;
        }
    }
    async calculateIntakeSugar(food_id, serving_count){
        try{
            const foodItem = await PackagedFood.findById(food_id).exec();
            if(!foodItem){
                throw new Error('Food item not found!');
            }
            const sugarsServing = foodItem.nutriments && foodItem.nutriments.Sugars;
            if (sugarsServing === undefined) {
              throw new Error('Sugar serving data not available for this food item');
            }
            const sugar = sugarsServing*serving_count;
            return sugar;
        }catch(error){
            console.error('Error in calculateIntakeSugar', error);  
            throw error;
        }
    }
    
    async returnSugarIntakeByDay(user_id, date){
        try{
            const startOfDay = date;
            const endOfDay = moment(startOfDay).tz("Pacific/Auckland").add(1, 'days').format();
            const intakeRecords = await SugarIntake.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(user_id),
                        date: {
                            $gte: startOfDay,   
                            $lt: endOfDay
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSugar: {$sum: '$sugar'}
                    }
                }
            ]);
            return intakeRecords.length > 0 ? intakeRecords[0].totalSugar : 0;
        }catch(error){
            console.error('Error in getting intake by day!', error);  
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
      if(result.length ===0){
        return {success: false, message: "No food data available."}
      }
      return {success: true, foodlist: result.map(item => item._id)};
    }catch(error){
      console.error('Error in getTopFoodsByUser', error);
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
      const food = await PackagedFood.findById(food_id);
      return {
        food: food,
        mostFrequentServingCount: result[0].mostFrequentServingCount
      };
    }catch(error){
      console.error('Error in getFoodServingCount', error);
      throw error;  
    }
  }

  async getTopIntakesList_byTimeIntervals(user_id){
    try{
        const now = moment().tz("Pacific/Auckland").format();
        const dateEndYesterday = moment(now).tz("Pacific/Auckland").subtract(1, 'days').endOf('day').format();

        const intakes = await SugarIntake.find({user: new mongoose.Types.ObjectId(user_id), date: {$lte: dateEndYesterday}});
        console.log(intakes);
        let intervalIntakes = {'0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': []};
        for(let intake of intakes){ 
            const hour = moment(intake.date).tz("Pacific/Auckland").hour();  
            let interval = this.determineInterval(hour);
            intervalIntakes[interval].push(intake);
        }   
        let result = {};
        for(let intervalIntake in intervalIntakes){
            let foodAndCounts = {};
            for(let intake of intervalIntakes[intervalIntake]){
                foodAndCounts[intake.food] = (foodAndCounts[intake.food] || 0) + 1;
            }
            let sortedFoodIds = Object.entries(foodAndCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
            result[intervalIntake] = { foodlist: sortedFoodIds };
        }   
        return result;
    }catch(error){
        console.error('Error in getTopIntakesList_byTimeIntervals', error);
    }
  }
  async getTopIntakeFoodIds_CurrentInterval(foodList){
    const hour = moment().tz("Pacific/Auckland").hour();
    let interval = this.determineInterval(hour);
    return foodList[interval].foodlist;
  }
  determineInterval(hour) {
    if (hour < 3) return '0';
    else if (hour < 6) return '1';
    else if (hour < 9) return '2';
    else if (hour < 12) return '3';
    else if (hour < 15) return '4';
    else if (hour < 18) return '5';
    else if (hour < 21) return '6';
    else return '7';
  }

  async getFoodDetailById(food_id){
    return PackagedFood.findById(food_id);
  }
}
module.exports = new Utils();