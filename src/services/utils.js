

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
            const sugarsServing = foodItem.nutriments && foodItem.nutriments.sugars_serving;
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
            const startOfDay = moment.tz(date, "UTC").tz("Pacific/Auckland").startOf('day').toDate();
            const endOfDay = moment(startOfDay).tz("Pacific/Auckland").add(1, 'days').toDate();
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
}
module.exports = new Utils();