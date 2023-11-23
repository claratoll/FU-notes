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

  const note = JSON.parse(event.body);

  const allowedFields = ['title', 'text'];

  if (!allowedFields.some((field) => note[field])) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide only a title and a text',
    });
  }

  if (!note.title && !note.text) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide a note and a title',
    });
  }

  if (note.title && note.title.length > 50) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter title, max 50 characters',
    });
  }

  if (note.text && note.text.length > 300) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter text, max 300 characters',
    });
  }

  //createdAt not changing
  const createdAt = new Date().toISOString();
  note.createdAt = `${createdAt}`;

  //modifiedAt changing each time note is changing
  const modifiedAt = new Date().toISOString();
  note.modifiedAt = `${modifiedAt}`;

  //generate id
  const noteId = nanoid();
  note.id = noteId;

  try {
    await db
      .put({
        TableName: 'notes-db',
        Item: note,
      })
      .promise();

    return sendResponse(200, { success: true, note });
  } catch (error) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a new note',
    });
  }
};
const handler = middy(addNote).use(validateToken);

module.exports = { handler };
