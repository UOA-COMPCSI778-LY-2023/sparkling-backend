const sugarIntakeService = require('../services/sugarIntakeService');
const userService = require('../services/userService');
const User = require('../db_models/User');
const moment = require('moment-timezone');
const apiService = require('../services/apiService');

class UserController{

  async getSugarIntakeToday(req, res){
    try {
      const username = req.params.username;
      const result = await sugarIntakeService.getDailyIntake(username);
      if(result.success == true){
        res.status(200).json({ack: 'success', status: 200, user: username, sugarToday: result.sugar});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).send({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in retrieving sugar intake data"});
    }
  }

  async getLastNDaysSugarIntake(req, res){
    try {
      const username = req.params.username;
      const days = parseInt(req.params.lastNDays, 10);
      const result = await sugarIntakeService.getLastNDaysIntake(username, days);
      if(result.success == true){
        res.status(200).json({ack: 'success', status: 200, user: username, report: result.dailyIntakes});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).send({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting user intake report!"});
    }
  }

  async setSurgarTarget(req, res){
    const{username, sugarTarget} = req.body;
    try {
      const result = await userService.setSurgarTarget(username, sugarTarget);
      if(result.success){
        res.status(200).json({ack: 'success', status: 200, message: "Set sugar target success!"});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in setting sugar target!"});
    }
  }

  async getSurgarTarget(req, res){
    const username = req.params.username;
    try {
      const result = await userService.getSurgarTarget(username);
      if(result.success==true){
        res.status(200).json({ack: 'success', status: 200, username: username, sugarTarget: result.sugarTarget});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting sugar target!"});
    }
  }

  async addSurgarIntake(req, res){
    try{
      let {username, code, serving_count, date} = req.body;  

      const dateFormat = "YYYY-MM-DDTHH:mm:ssZ";
      if (!moment(date, dateFormat, true).isValid()) {
        date = moment().tz("Pacific/Auckland").format();
      }
      const result = await sugarIntakeService.addSugarIntake(username, code, serving_count, date);
      if (result.success == true) {
      res.status(200).json({ack: 'success', status: 200, message: "Add sugar intake success!"});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    }catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in adding sugar intake!"});
    }
  }

  async listSurgarIntakesToday(req, res){
    try{
      const username = req.params.username;  
      const result = await sugarIntakeService.getIntakesListToday(username);

      if (result.success == true) {
      res.status(200).json({ack: 'success', status: 200, username: username, list: result.list});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    }catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting intake list!"});
    }
  }
  async listSurgarIntakesLastWeek(req, res){
    try{
      const username = req.params.username;  
      const result = await sugarIntakeService.getIntakesListLastWeek(username);

      if (result.success == true) {
      res.status(200).json({ack: 'success', status: 200, username: username, list: result.list});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    }catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting intake list!"});
    }
  }

  async removeSurgarIntake(req, res){ 
    try{
      const {username, record_id} = req.body;  
      const result = await sugarIntakeService.removeSugarIntake(username, record_id);
      if (result.success == true) {
      res.status(200).json({ack: 'success', status: 200, message: "Remove sugar intake success!"});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND",  message: result.message});
      }
    }catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in removing sugar intake!"});
    }
  }

  async createUser(req, res){
    try {
      const newUser = new User(req.body);
      const result = await userService.createUser(newUser);
      if (result.success) {
        res.status(200).json({ack: 'success', status: 200, message: "User creating success!"});
      }else{
        res.status(200).json({ack: 'failure', status: 409, errorCode: "USERNAME_ALREADY_EXISTS", message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in creating new user"});
    }
  }

  async addScanRecord(req, res){
    const {username, code} = req.body
    try {
      const result = await userService.addScanRecord(username, code);
      if (result.success == true) {
        res.status(200).json({ack: 'success', status: 200, message: "Add scan record success!"});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in adding scan record!"});
    }
  }

  async getScanRecords(req, res){
    const username = req.params.username;
    try {
      const result = await userService.getScanRecords(username);
      if(result.success == true){
        res.status(200).json({ack: 'success', status: 200, records: result.scanHistories});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND", message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting scan record!"});
    }
  }

  async getInatkePrediction(req, res){
    const username = req.params.username;
    try {
      const result = await sugarIntakeService.foodPrediction_byTime(username);
      if(result.success == true){
        res.status(200).json({ack: 'success', status: 200, username: username, predictions: result.predictions});
      }else{
        res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND",  message: result.message});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting intake predictions!"});
    }
  }

  async getInatkeModelPrediction(req, res){
    const username = req.params.username;
    try {
      const user = await User.findOne({username: username});
      if (!user) {
        return res.status(200).json({ack: 'failure', status: 404, errorCode: "RESOURCE_NOT_FOUND",  message: result.message});
      }
      const user_id = user._id;
      const result = await apiService.getInatkeModelPrediction(user_id)

      if(result.success == true){
        res.status(200).json({ack: 'success', status: 200, username: username, predictions: result.predictions});
      }
    } catch (error) {
      res.status(200).json({ack: 'failure', status: 500, errorCode: "INTERNAL_SERVICE_ERROR", message: "Error in getting intake predictions!"});
    }
  }
}

module.exports = new UserController();
