
/* 
quiz {
    userId;
    quizType;
    Q1
    A1
    ...
    Qn
    An
}
*/

async function getQuizCollection(client) {
    const database = client.db("bridgability");
    return database.collection("quiz");
}

async function addQuiz(client, quiz) {
    const quizCollection = await getQuizCollection(client);

    try {
        return await quizCollection.insertOne(quiz);
    } catch (err) {
        return {error: 'can not add quiz:' + err.message};
    }
}

async function getQuiz(client, {user, type}) {
    const quizCollection = await getQuizCollection(client);

    const quiz = await quizCollection.findOne({user, type});
    if (!quiz) {
        return {error: 'quiz not found' + err.message};
    }
    return quiz;
}

module.exports = {
    addQuiz,
    getQuiz
}