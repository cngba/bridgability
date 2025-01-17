const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database connection

// ROUTES
const userRoutes = require('./routes/userRoutes'); 
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let dbClient;

// Initialize the database connection
db.connectToDatabase()
  .then((client) => {
    dbClient = client;

    app.use('/users', userRoutes(dbClient));
    app.use('/profiles', profileRoutes(dbClient));
    app.use('/jobs', jobRoutes(dbClient));
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
