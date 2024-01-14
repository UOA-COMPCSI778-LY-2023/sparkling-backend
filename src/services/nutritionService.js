const PackagedFood = require('../db_models/PackagedFood');

class NutritionService{
    async addPackagedFood(packagedFoodData){
        try {
            const existingFood = await PackagedFood.findOne({code: packagedFoodData.code});
            if(existingFood){
                return { success: false, message: "Packaged food already exist!" }; 
            };
            const newPFood = new PackagedFood(packagedFoodData);
            await newPFood.save();
            return { success: true};
           } catch (error) {
            console.error("Error in adding packaged food:", error);
            throw error;
           }
    }

    async getPackagedFood(code){
        try {
            const packagedFood = await PackagedFood.findOne({code: code});
            if(!packagedFood){
                return { success: false, message: "Packaged food not found!"}; 
            };
            return {success: true, data: packagedFood};
           } catch (error) {
            throw error;
           }
    }
}

module.exports = new NutritionService();