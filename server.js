require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const routers = require('./src/routes/routes');

app.use(express.json());
app.use('/', routers);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// MongoDB Atlas uri
const dbUri = process.env.MONGODB_URI; 

// Connect MongoDB
mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));    
