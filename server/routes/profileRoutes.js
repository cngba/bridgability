const express = require('express');
const {authenticateToken} = require('../utils/token')

const profileDb = require('../db/profileDb');

const profileRoutes = (dbClient) => {
  const router = express.Router();

  // Route to get the profile of the signed-in user
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const profile = await profileDb.getProfile(dbClient, { id: req.userId }); // Use the userId from the token

      return res.status(200).json({ success: true, profile });
    } catch (err) {
      if (err.message === 'Profile not found.') {
        return res.status(404).json({ error: 'Profile not found.' });
      } else {
        return res.status(500).json({ error: 'An error occurred while fetching the profile.' });
      }
    }
  });
  
  router.put('/', authenticateToken, async (req, res) => {
    try {
      const { name, age, location, skills } = req.body;
  
      // Validate input
      if (!name || !age || !location || !skills || !Array.isArray(skills)) {
        return res.status(400).json({ error: 'Invalid input. Please provide all required fields.' });
      }
  
      // Use the userId from the token
      const userId = req.userId;
  
      // Update the profile in the database
      const updatedProfile = await profileDb.updateProfile(dbClient, {
        id: userId,
        name,
        age,
        location,
        skills,
      });
  
      // Check if the profile was successfully updated
      if (updatedProfile) {
        res.status(200).json({ success: true, message: 'Profile updated successfully.', profile: updatedProfile });
      }
      res.status(404).json({ error: 'Profile not found.' });
      
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'An error occurred while updating the profile.' });
    }
  });
  
  return router;
};

module.exports = profileRoutes;
