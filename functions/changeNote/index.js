const { sendResponse } = require('../../responses/index.js');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const { notesId } = event.pathParameters;

  const updateAttributes = JSON.parse(event.body);

  const updateExpression =
    'set ' +
    Object.keys(updateAttributes).map(
      (attributeName) => `${attributeName} = :${attributeName}`
    );

  const expressionAttributeValues = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
      values[`:${attributeName}`] = updateAttributes[attributeName];
      return values;
    },
    {}
  );

  expressionAttributeValues[':notesId'] = notesId;

  try {
    await db
      .update({
        TableName: 'notes-db',
        Key: { id: notesId },
        ReturnValues: 'ALL_NEW',
        UpdateExpression: updateExpression,
        ConditionExpression: 'id = :notesId',
        ExpressionAttributeValues: expressionAttributeValues,
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, { message: 'could not update' });
  }
};
