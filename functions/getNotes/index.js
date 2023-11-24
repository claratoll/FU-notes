const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();

const getNotes = async (event, context) => {
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }
  const userId = event.id;

  try {
    const { Items } = await db
      .scan({
        TableName: 'notes-db',
        FilterExpression: '#userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();
    return sendResponse(200, { success: true, notes: Items });
  } catch (error) {
    console.log(error);
    return sendResponse(400, {
      success: false,
      message: 'Could not get notes',
    });
  }
};

const handler = middy(getNotes).use(validateToken);

module.exports = { handler };
