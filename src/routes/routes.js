const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const nutritionController = require('../controllers/nutritionController');

router.get('/', (req, res) => {
  res.send('Welcome to Light Surgar!');
});

router.get('/users/:username/sugar-intake-today', userController.getSugarIntakeToday);
router.get('/users/:username/report/:lastNDays', userController.getLastNDaysSugarIntake);
router.post('/users/sugar-intake/target', userController.setSurgarTarget);
router.post('/users/sugar-intake/add', userController.addSurgarIntake);
router.post('/users/sugar-intake/remove', userController.removeSurgarIntake);
router.get('/users/:username/intakes-list-today', userController.listSurgarIntakesToday);
router.get('/users/:username/intakes-list-weekly', userController.listSurgarIntakesLastWeek);
router.post('/users/scan-record', userController.addScanRecord);
router.get('/users/:username/scan-records', userController.getScanRecords);
router.post('/users/create', userController.createUser);
router.get('/packaged-food/:code', nutritionController.getPackagedFood);
router.post('/packaged-food', nutritionController.addPackagedFood); 
router.get('/users/:username/intake-prediction', userController.getInatkePrediction); 
router.get('/users/:username/target', userController.getSurgarTarget); 
router.get('/users/:username/intake-model-prediction', userController.getInatkeModelPrediction); 


module.exports = router;