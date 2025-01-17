async function getCollection(client) {
    const db = client.db("bridgability");
    return db.collection("jobs")
}

async function addJob(client, userId, jobData) {
    // job: JSON object

    // Get current logged in userId + check if type is EMPLOYER
    const job = {
        id: userId,
        jobData
    }

    const collection = await getCollection(client);
    
    return await collection.insertOne(job);
}

async function getAllJob(client) {
    const collection = await getCollection(client);

    const allJobs = await collection.find();
    return allJobs;
}

async function getJob(client, { id }) {
    const collection = await getCollection(client);
    const result = await collection.findone({ id });
    if (!result) {
        throw new Error('Job not found');
    }

    return result;
}

tempJob = {
    "name": "Software Developer",
    "description": "Build front-end and back-end apps at our office.",
    "creator": "IDxxxxx",
    "requirement": "Bs.CS",
    "opening_date": "2025-01-01",
    "closing_date": "2025-01-31"
}

module.exports = {
    addJob, getAllJob, getJob
}
