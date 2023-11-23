const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses/index');
const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();

const changeNote = async (event, context) => {
  if (event?.error && event.error === '401') {
    return sendResponse(401, { success: false, message: 'Invalid token' });
  }

  const updateNoteInput = JSON.parse(event.body);

  const allowedFields = ['id', 'title', 'text'];

  if (!allowedFields.some((field) => updateNoteInput[field])) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide only a title and a text, with the correct id',
    });
  }

  if (!updateNoteInput.title && !updateNoteInput.text) {
    return sendResponse(400, {
      success: false,
      message: 'Please provide a note and a title',
    });
  }

  if (updateNoteInput.title && updateNoteInput.title.length > 50) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter title, max 50 characters',
    });
  }

  if (updateNoteInput.text && updateNoteInput.text.length > 300) {
    return sendResponse(400, {
      success: false,
      message: 'Please write a shorter text, max 300 characters',
    });
  }

  const noteIdToChange = updateNoteInput.id;

  // Check if the note with the given ID exists
  const existingNote = await db
    .get({
      TableName: 'notes-db',
      Key: { id: noteIdToChange },
    })
    .promise();

  if (!existingNote.Item) {
    return sendResponse(404, {
      success: false,
      message: 'Note with the provided ID not found',
    });
  }

  //modifiedAt changing each time note is changing
  const modifiedAt = new Date().toISOString();

  try {
    await db
      .update({
        TableName: 'notes-db',
        Key: { id: noteIdToChange },
        ReturnValues: 'ALL_NEW',
        UpdateExpression:
          'SET #title = :title, #text = :text, #modifiedAt = :modifiedAt',
        ExpressionAttributeValues: {
          ':title': updateNoteInput.title || existingNote.Item.title,
          ':text': updateNoteInput.text || existingNote.Item.text,
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
