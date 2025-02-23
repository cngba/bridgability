async function getCollection(client) {
    const database = client.db("bridgability");
    return database.collection("profiles");
}

async function addProfile(client, body) {
  const Collection = await getCollection(client);

  const profile = {
    user: body.id,
    name: body.name,
    type: body.type,
    age: body.age,
    location: body.location,
    bio: body.bio
  };

  const result = await Collection.insertOne(profile);
  return result;
}

async function getProfile(client, { id }) {
    const collection = await getCollection(client);

    const existing = await collection.findOne({ user: id });
    if (!existing) {
      throw new Error('Profile not found.');
    }
  
    return existing;
}

// async function modifyProfile(client, newProfile) {
//   const Collection = await getCollection(client);

//   // Find the existing document for the user
//   const existingProfile = await Collection.findOne({ user: id });

//   if (!existingProfile) {
//     throw new Error("Profile not found for the given user ID.");
//   }

//   // Overwrite existing fields with the new profile data
//   const updatedProfile = {
//     ...existingProfile, // Keep existing fields (e.g., _id)
//     ...newProfile,      // Overwrite with new profile data
//   };

//   // Save the updated profile in the database
//   const result = await Collection.replaceOne(
//     { user: id },       // Filter: Match the user by ID
//     updatedProfile      // Replace the document with the updated one
//   );

//   return result;
// }

module.exports = {
    addProfile, getProfile, 
    // modifyProfile
};