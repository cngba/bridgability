const { ObjectId } = require('mongodb');

async function getUsersCollection(client) {
  const database = client.db("bridgability");
  return database.collection("users");
}

async function addUser(client, user) {
  const usersCollection = await getUsersCollection(client);

  const existingUser = await usersCollection.findOne({ email: user.email });
  if (existingUser) {
    throw new Error('Email is already in use.');
  }

  try {
    const result = await usersCollection.insertOne(user);
    return result;
  } catch (error) {
    throw new Error("Error adding user: " + error.message);
  }
}

async function getUser(client, { email }) {
  const usersCollection = await getUsersCollection(client);

  // Find the user by email
  const existingUser = await usersCollection.findOne({ email: email });
  if (!existingUser) {
    return { error: 'User not found.' };
  }
  return existingUser;
}

async function getUserById(client, { id }) {
  const usersCollection = await getUsersCollection(client);

  const objectId = new ObjectId(id);

  console.log(id);
  // Find the user by id
  const existingUser = await usersCollection.findOne({ _id: objectId });
  if (!existingUser) {
    return { error: 'User not found.' };
  }
  return existingUser;
}

module.exports = {
  addUser,
  getUser,
  getUserById,
  // getAllUsers,
};
