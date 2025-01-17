require('dotenv').config(); 

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDb = require('../db/userDb'); // Import userDb for database operations
const profileDb = require('../db/profileDb');

const userRoutes = (dbClient) => {
  const router = express.Router();

  // Route to add a new user
  router.post('/add', async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!email || !password) {
      return res.status(400).send("All fields are required.");
    }
    
    const result = await userDb.addUser(dbClient, { email, password: hashedPassword });
    await profileDb.addProfile(dbClient, result.insertedId.toString());
    
    res.status(201).send(`User added with ID: ${result.insertedId.toString()}`);
      
  });

  router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }
  
    const user = await userDb.getUser(dbClient, { email });
    const userId = user._id.toString();
    
    if (user.error) {  // Check if there's an error message
      return res.status(400).send(user.error);  // Send the error message
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Incorrect password.");
    }
    
    console.log()
    const token = jwt.sign({ id: userId }, process.env.SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  })
  

  return router;
};

module.exports = userRoutes;
