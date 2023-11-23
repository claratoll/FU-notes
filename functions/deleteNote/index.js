const { sendResponse } = require('../../responses/index.js');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const note = JSON.parse(event.body);

  const timeStamp = new Date().getTime();

  note.id = `${timeStamp}`;

  try {
    await db
      .put({
        TableName: 'notes-db',
        Item: note,
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { success: false });
  }
};
