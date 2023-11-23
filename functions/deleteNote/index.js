const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core'); // Vi importerar middy

const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();

const deleteNote = async (event, context) => {
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }
  const note = JSON.parse(event.body);

  try {
    await db
      .delete({
        TableName: 'notes-db',
        Key: { id: note.id },
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { success: false });
  }
};

const handler = middy(deleteNote).use(validateToken);

module.exports = { handler };
