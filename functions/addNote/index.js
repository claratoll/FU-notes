const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core'); // Vi importerar middy
const { nanoid } = require('nanoid');
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();

const addNote = async (event, context) => {
  // Här ändrar vi från exports.handler...
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }
  const userName = event.username;
  const userId = event.id;
  const { title, text, ...rest } = JSON.parse(event.body);

  if (Object.keys(rest).length > 0) {
    return sendResponse(400, {
      success: false,
      message: 'Invalid properties. Only title and text are allowed.',
    });
  }

  if (!title && !text) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide a text and a title',
    });
  }

  if (title && title.length > 50) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter title, max 50 characters',
    });
  }

  if (text && text.length > 300) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter text, max 300 characters',
    });
  }

  const createdAt = new Date().toISOString();

  const modifiedAt = new Date().toISOString();

  const note = {
    id: nanoid(),
    userId: userId,
    userName: userName,
    title: title,
    text: text,
    createdAt: createdAt,
    modifiedAt: modifiedAt,
  };

  try {
    await db
      .put({
        TableName: 'notes-db',
        Item: note,
      })
      .promise();

    return sendResponse(200, {
      success: true,
      note: note,
    });
  } catch (error) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a new note',
    });
  }
};
const handler = middy(addNote).use(validateToken);

module.exports = { handler };
