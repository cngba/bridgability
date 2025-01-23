const express = require('express');
const axios = require('axios'); // Import Axios for HTTP requests

const { authenticateToken } = require('../utils/token');
const jobDb = require('../db/jobDb');
const userDb = require('../db/userDb');
const { getProfile } = require('../db/profileDb');

const jobRoutes = (dbClient) => {
  const router = express.Router();

  // Route to add a new job
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const { name, description, requirement, opening_date, closing_date } = req.body;

      // Validate input
      if (!name || !description || !requirement || !opening_date || !closing_date) {
        return res.status(400).json({ error: 'Invalid input. Please provide all required fields.' });
      }

      // Construct job data
      const jobData = {
        name,
        description,
        creator: userId,
        requirement,
        opening_date,
        closing_date,
      };

      // Add the job to the database
      const result = await jobDb.addJob(dbClient, userId, jobData);

      res.status(201).json({ success: true, message: 'Job created successfully.', jobId: result.insertedId });
    } catch (err) {
      console.error('Error adding job:', err);
      res.status(500).json({ error: 'An error occurred while adding the job.' });
    }
  });

  // Route to get all jobs
  router.get('/', async (req, res) => {
    
    // try {
      console.log("Finding jobs...");
      const jobs = await jobDb.getAllJob(dbClient);

      // Convert cursor to array
      const jobList = await jobs.toArray();

      res.status(200).json({ success: true, jobs: jobList });
    // } catch (err) {
    //   console.error('Error fetching jobs:', err);
    //   res.status(500).json({ error: 'An error occurred while fetching the jobs.' });
    // }
  });

  router.post('/match', authenticateToken, async (req, res) => {
    const userId = req.userId;
    // const account = await userDb.getUserById(dbClient, {id: userId});
    const user = await getProfile(dbClient, {id: userId})
    console.log(user);

    const payload = {
      "person": {
        "name": user.name,        // Replace with actual user data
        "age": user.age,                 // Replace with actual user data
        "location": user.location,    // Replace with actual user data
        "bio": user.bio // Replace with actual user data
      }
    };

    const response = await axios.post('http://0.0.0.0:9000/match', payload);

    res.status(200).json({statusCode: 200, jobs: response.data} );
  }); 

  // Route to get a specific job by ID
  // Not really necessary, front-end just fetched everything
  router.get('/:id', async (req, res) => {
    try {
      const jobId = req.params.id;

      // Fetch job from the database
      const job = await jobDb.getJob(dbClient, { id: jobId });

      res.status(200).json({ success: true, job });
    } catch (err) {
      if (err.message === 'Job not found') {
        res.status(404).json({ error: 'Job not found.' });
      } else {
        console.error('Error fetching job:', err);
        res.status(500).json({ error: 'An error occurred while fetching the job.' });
      }
    }
  });

  return router;
};

module.exports = jobRoutes;
