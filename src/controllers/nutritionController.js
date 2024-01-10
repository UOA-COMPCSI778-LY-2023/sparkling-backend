const PackagedFood = require('../db_models/PackagedFood');
const nutritionService = require('../services/nutritionService')

class NutritioController{
    async addPackagedFood(req, res){
        try{
            const newPackagedFood= new PackagedFood(req.body);
            const result = await nutritionService.addPackagedFood(newPackagedFood);
            if(result.success){
                res.status(200).json({message: "Add packaged food success!"})
            }else{
                    res.status(400).json({ message: "Add packaged food failed!" });
                  }
        }catch(error){
            res.status(500).json({message: "Error adding new packaged food!", error });
        }
    }

    async getPackagedFood(req, res){
        try {
            const code = req.params.code;
            const packagedFood = await nutritionService.getPackagedFood(code);
            if (!packagedFood || packagedFood.length === 0) {
                return res.status(404).json({ message: "Packaged food not found!" });   
            }
            res.status(200).json(packagedFood);               
        }catch(error){
            res.status(500).json({message: "Error getting packaged food information!", error });
        }
    }
}
module.exports = new NutritioController();