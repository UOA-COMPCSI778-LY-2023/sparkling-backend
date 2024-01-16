const PackagedFood = require('../db_models/PackagedFood');
const nutritionService = require('../services/nutritionService')

class NutritioController{
    async addPackagedFood(req, res){
        try{
            const newFood= req.body;
            const result = await nutritionService.addPackagedFood(newFood);
            if(result.success === true){
                res.status(200).json({ack: 'success', status: 200, message: "Add packaged food success!"})
            }else{
                    res.status(200).json({ack: 'failure', status: 409, errorCode: "FOOD_ALREADY_EXISTS",  message: result.message});
                  }
        }catch(error){
            res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in adding new packaged food!"});
        }
    }

    async getPackagedFood(req, res){
        try {
            const code = req.params.code;
            const result = await nutritionService.getPackagedFood(code);
            if (result.success === true) {
                res.status(200).json({ack: 'success', status: 200, data: result.data});  
            }else{
                return res.status(200).json({ack: 'failure', status: 404, errorCode: "FOOD_NOT_FOUND",  message: result.message}); 
            }           
        }catch(error){
            res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting packaged food information!"});
        }
    }
}
module.exports = new NutritioController();