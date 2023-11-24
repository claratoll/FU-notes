const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

async function getUserIdByUsername(username) {
  try {
    const user = await db
      .get({
        TableName: 'note-accounts',
        Key: {
          username: username,
        },
      })
      .promise();

    return user?.Item?.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { getUserIdByUsername };
