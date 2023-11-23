const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendResponse } = require('../../responses');

async function getUser(username) {
  try {
    const user = await db
      .get({
        TableName: 'note-accounts',
        Key: {
          username: username,
        },
      })
      .promise();
    if (user?.Item) {
      return { success: true, message: 'User found!', user: user.Item };
    } else {
      return { success: false, message: 'Incorrect username and/or password' };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database error', error: error };
  }
}

async function login(username, password) {
  const userResponse = await getUser(username);

  if (!userResponse.success) {
    return userResponse;
  }

  const user = userResponse.user;

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    return { success: false, message: 'Incorrect username and/or password' };
  }

  const token = jwt.sign(
    { id: user.userId, username: user.username },
    'aabbcc',
    { expiresIn: 3600 }
  );
  return { success: true, message: 'Login successful', token: token };
}

exports.handler = async (event, context) => {
  const { username, password } = JSON.parse(event.body);
  const loginResponse = await login(username, password);

  return sendResponse(loginResponse.success ? 200 : 400, loginResponse);
};
