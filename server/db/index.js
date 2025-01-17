require('dotenv').config(); // Load environment variables from .env file

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://congngba21:CongNguyen0408@cluster0.va8jw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  client,
};
