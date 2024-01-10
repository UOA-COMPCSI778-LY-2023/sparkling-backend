const sugarIntakeService = require('../services/sugarIntakeService');
const userService = require('../services/userService');
const User = require('../db_models/User');

class UserController{

  async getSugarIntakeToday(req, res){
    try {
      const username = req.params.username;
      const result = await sugarIntakeService.getDailyIntake(username);
      if(result.success == true){
        res.status(200).json({user: username, sugarToday: result.sugar});
      }else{
        res.status(404).json({message: result.message});
      }
    } catch (error) {
      res.status(500).send({ message: "Error retrieving sugar intake data"});
    }
  }

  async getLastNDaysSugarIntake(req, res){
    try {
      const username = req.params.username;
      const days = parseInt(req.params.lastNDays, 10);
      const today = new Date();
      const result = await sugarIntakeService.getLastNDaysIntake(username, today, days);
      if(result.success == true){
        res.status(200).json({user: username, report: result.dailyIntakes});
      }else{
        res.status(404).json({message: result.message});
      }
    } catch (error) {
      console.error('Error in getLastNDaysSugarIntake:', error);
      res.status(500).send({ message: "Error in getting user intake report!"});
    }
  }

  async setSurgarTarget(req, res){
    const{username, sugarTarget} = req.body;
    try {
      const result = await userService.setSurgarTarget(username, sugarTarget);
      if(result.success){
        res.status(200).json({message: "Set sugar target success!"});
      }else{
        res.status(404).json({ message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error setting sugar target!"});
    }
  }

  async getSurgarTarget(req, res){
    const username = req.params.username;
    try {
      const result = await userService.getSurgarTarget(username);
      if(result.success==true){
        res.status(200).json({username: username, sugarTarget: result.sugarTarget});
      }else{
        res.status(404).json({ message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error getting sugar target!"});
    }
  }

  async addSurgarIntake(req, res){
    try{
      const {username, code, serving_count} = req.body;  
      const result = await sugarIntakeService.addSugarIntake(username, code, serving_count);
      if (result.success == true) {
      res.status(200).json({message: "Add sugar intake success!"});
      }else{
        res.status(404).json({ message: result.message});
      }
    }catch (error) {
      res.status(500).json({message: "Error adding sugar intake!"});
    }
  }

  async listSurgarIntakesToday(req, res){
    try{
      const username = req.params.username;  
      const result = await sugarIntakeService.getIntakesListToday(username);

      if (result.success == true) {
      res.status(200).json({username: username, list: result.list});
      }else{
        res.status(404).json({ message: result.message});
      }
    }catch (error) {
      res.status(500).json({message: "Error in getting intake list!"});
    }
  }

  async removeSurgarIntake(req, res){ 
    try{
      const {username, record_id} = req.body;  
      const result = await sugarIntakeService.removeSugarIntake(username, record_id);
      if (result.success == true) {
      res.status(200).json({message: "Remove sugar intake success!"});
      }else{
        res.status(404).json({ message: result.message});
      }
    }catch (error) {
      res.status(500).json({message: "Error in removing sugar intake!"});
    }
  }

  async createUser(req, res){
    try {
      const newUser = new User(req.body);
      const result = await userService.createUser(newUser);
      if (result.success) {
        res.status(200).json({ message: "User creating success!"});
      }else{
        res.status(400).json({message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error creating new user"});
    }
  }

  async addScanRecord(req, res){
    const {username, code} = req.body
    try {
      const result = await userService.addScanRecord(username, code);
      if (result.success == true) {
        res.status(200).json({message: "Add scan record success!"});
      }else{
        res.status(404).json({ message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error adding scan record!"});
    }
  }

  async getScanRecords(req, res){
    const username = req.params.username;
    try {
      const result = await userService.getScanRecords(username);
      if(result.success == true){
        res.status(200).json({records: result.scanHistories});
      }else{
        res.status(404).json({ message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error getting scan record!"});
    }
  }

  async getInatkeRecommendation(req, res){
    const username = req.params.username;
    try {
      const result = await sugarIntakeService.foodRecommendation(username);
      if(result.success == true){
        res.status(200).json({username: username, recommendations: result.recommendations});
      }else{
        res.status(404).json({ message: result.message});
      }
    } catch (error) {
      res.status(500).json({message: "Error in getting intake recommendation!"});
    }
  }
}

module.exports = new UserController();
