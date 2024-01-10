const PackagedFood = require('../db_models/PackagedFood');

class NutritionService{
    async addPackagedFood(packagedFood){
        try {
            await packagedFood.save();
            return { success: true};
           } catch (error) {
            throw error;
           }
    }

    async getPackagedFood(code){
        try {
            const packagedFood = await PackagedFood.findOne({code: code});
            return packagedFood;
           } catch (error) {
            throw error;
           }
    }
}

module.exports = new NutritionService();