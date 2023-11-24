const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');

const db = new AWS.DynamoDB.DocumentClient();

const changeNote = async (event, context) => {
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }
  const userId = event.id;
  const userName = event.username;

  const { id, title, text, ...rest } = JSON.parse(event.body);

  if (Object.keys(rest).length > 0) {
    return sendResponse(400, {
      success: false,
      message: 'Invalid properties. Only id, title and text are allowed.',
    });
  }

  if (!title && !text) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide a note and a title',
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

  const existingNote = await db
    .get({
      TableName: 'notes-db',
      Key: { id: id },
    })
    .promise();

  if (!existingNote.Item) {
    return sendResponse(404, {
      success: false,
      message: 'Note with the provided ID not found',
    });
  }

  if (userName !== existingNote.Item.userName) {
    return sendResponse(403, {
      success: false,
      message: 'You are not authorized to update this note',
    });
  }

  const modifiedAt = new Date().toISOString();

  try {
    await db
      .update({
        TableName: 'notes-db',
        Key: { id: id },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
          'SET #title = :title, #text = :text, #modifiedAt = :modifiedAt',
        ExpressionAttributeValues: {
          ':title': title || existingNote.Item.title,
          ':text': text || existingNote.Item.text,
          ':modifiedAt': modifiedAt,
        },
        ExpressionAttributeNames: {
          '#title': 'title',
          '#text': 'text',
          '#modifiedAt': 'modifiedAt',
        },
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, {
      message: 'could not update the note',
      error: error,
    });
  }
};

const handler = middy(changeNote).use(validateToken);

module.exports = { handler };
