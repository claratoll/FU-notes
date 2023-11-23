const { sendResponse } = require('../../responses/index.js');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const dog = JSON.parse(event.body);

  const timeStamp = new Date().getTime();

  dog.id = `${timeStamp}`;

  try {
    await db
      .put({
        TableName: 'dogs-db',
        Item: dog,
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { success: false });
  }
};
