
const ScanHistory = require('../db_models/ScanHistory');
const User = require('../db_models/User');
const PackagedFood = require('../db_models/PackagedFood');


class UserService{
    async createUser(newUser){
       try {
        const user = await User.findOne({username: newUser.username});
        if(user){
            return{success: false, message: 'Username already exists!'};
        }
        await newUser.save();
        return { success: true}
       } catch (error) {
        throw error;    
       }
    }

    async setSurgarTarget(username, sugarTarget){
        try {
         const user = await User.findOne({username: username});
         if(!user){
            return {success: false, message: 'User does not exist!'}
         }
         user.sugarTarget = sugarTarget;
         await user.save();
         return { success: true}
        } catch (error) {
         throw error;    
        }
     }

     async getSurgarTarget(username){
        try {
         const user = await User.findOne({username: username});
         if(!user){
            return {success: false, message: 'User does not exist!'}
         }
         const sugarTarget = user.sugarTarget;
         return  {success: true, sugarTarget: sugarTarget};
        } catch (error) {
         throw error;    
        }
     }

    async addScanRecord(username, code){
        try {
            const user = await User.findOne({username: username});
            const food = await PackagedFood.findOne({code: code});
            if (!user || !food) {
                return {success: false, message: 'User or food does not exist!'};
              }
            const history = new ScanHistory({
                user: user._id, 
                food: food._id
            });
            await history.save();
            return {success: true}
        } catch (error) {
         throw error;
        }
     }

     async getScanRecords(username){
        try {
            const users = await User.findOne({username: username});
            if (!users) {
                return {success: false, message: 'User does not found!'};
            }
            const userObjectId = users.id;
            const scanHistories = await ScanHistory.find({user: userObjectId}).populate('food');
            return {success: true, scanHistories};
        } catch (error) {
            console.log(error);
            throw error;
        }
     }
}

module.exports = new UserService();