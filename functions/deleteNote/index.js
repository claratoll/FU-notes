const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core'); // Vi importerar middy
const { validateToken } = require('../middleware/auth');
const { getUserIdByUsername } = require('../getUserIdByUsername/index');
const db = new AWS.DynamoDB.DocumentClient();

const deleteNote = async (event, context) => {
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }
  const note = JSON.parse(event.body);
  const userId = event.id;
  const userName = note.username;

  const allowedFields = ['id'];

  if (!allowedFields.some((field) => note[field])) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide an id',
    });
  }

  if (!note.id) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide a correct id',
    });
  }

  try {
    const existingNote = await db
      .get({
        TableName: 'notes-db',
        Key: { id: note.id },
      })
      .promise();

    if (existingNote?.Item?.username !== userName) {
      return sendResponse(403, {
        success: false,
        message: 'You are not the owner of this note',
      });
    }

    await db
      .delete({
        TableName: 'notes-db',
        Key: { id: note.id },
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { success: false, error: error });
  }
};

const handler = middy(deleteNote).use(validateToken);

module.exports = { handler };
