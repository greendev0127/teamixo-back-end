import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, error: "Bad Request" });
    }
    const { CLIENT_ID } = process.env;

    const userId = uuid.v1();

    const params = {
      ClientId: CLIENT_ID,
      Password: data.password,
      Username: data.email,
      UserAttributes: [
        {
          Name: "email",
          Value: data.email,
        },
        {
          Name: "custom:user_id",
          Value: userId,
        },
        {
          Name: "custom:role",
          Value: "owner",
        },
        {
          Name: "custom:level",
          Value: "1",
        },
      ],
    };
    const response = await cognito.signUp(params).promise();

    const Item = {
      id: response.UserSub,
      email: data.email,
      state: "free",
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const organizationParam = {
      TableName: "organization",
      Item,
    };

    await dynamoDb.put(organizationParam).promise();

    const pin = Math.floor(1000 + Math.random() * 9000);

    var staffItems = {
      id: userId,
      organization_id: response.UserSub,
      email: data.email,
      name: data.fname,
      first_name: data.firstName,
      last_name: data.lastName,
      avatar: process.env.DEFAULT_AVATAR,
      pin: pin,
      role: ["owner"],
      level: 1,
      type: 1,
      site_id: null,
      track_id: null,
      clocked_state: false,
      state: true,
      last_start_date: null,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const staffParams = {
      TableName: "staff_list",
      Item: staffItems,
    };

    await dynamoDb.put(staffParams).promise();

    res.status(200).json({
      statusCode: 200,
      message: "User registration successful",
      response: response,
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const { USER_POOL_ID, CLIENT_ID } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password,
      },
    };
    const response = await cognito.adminInitiateAuth(params).promise();
    res.status(200).json({
      statusCode: 200,
      message: "Login succeed",
      token: response.AuthenticationResult.IdToken,
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});

router.post("/confirmEmail", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const { CLIENT_ID } = process.env;
    const params = {
      ClientId: CLIENT_ID,
      Username: data.email,
      ConfirmationCode: data.confirmCode,
    };
    const response = await cognito.confirmSignUp(params).promise();

    res.status(200).json({
      statusCode: 200,
      message: `Confirm succeffsul about ${data.email}`,
      response: response,
    });
  } catch (error) {
    console.error("An error occured:", error);
    res.status(200).json(error);
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const { CLIENT_ID } = process.env;

    const params = {
      ClientId: CLIENT_ID, // replace with your App client id
      Username: data.useremail, // replace with the username
    };

    const response = await cognito.forgotPassword(params).promise();
    return res.status(200).json({ statusCode: 200, response });
  } catch (error) {
    console.log("An error occured:", error);
    res.status(200).json(error);
  }
});

router.post("/setpassword", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request",
      });
    }

    var verifyParams = {
      UserPoolId: process.env.USER_POOL_ID, // replace with your User Pool ID
      Username: data.email, // replace with the user's username
      Password: data.password, // replace with the user's real password
      Permanent: true,
    };

    const response = await cognito.adminSetUserPassword(verifyParams).promise();

    return res.status(200).json({ statusCode: 200, response });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/confirmforgot", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request",
      });
    }

    const { CLIENT_ID } = process.env;

    const params = {
      ClientId: CLIENT_ID, // replace with your App client id
      Username: data.username, // replace with the username
      ConfirmationCode: data.confirmationCode, // replace with the confirmation code
      Password: data.newPassword, // replace with the new password
    };

    const response = await cognito.confirmForgotPassword(params).promise();

    return res.status(200).json({
      statusCode: 200,
      response,
      message: "Password has been changed successfully.",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/changeEmail", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request",
      });
    }

    const { USER_POOL_ID } = process.env;

    const params = {
      UserPoolId: USER_POOL_ID, // replace with your User Pool ID
      Username: data.oldEmail, // replace with the old email
      UserAttributes: [
        {
          Name: "email",
          Value: data.newEmail, // replace with the new email
        },
        {
          Name: "email_verified",
          Value: "false",
        },
      ],
    };

    const response = await cognito.adminUpdateUserAttributes(params).promise();

    const verificationParam = {
      UserPoolId: USER_POOL_ID,
      Username: data.oldEmail,
      AttributeName: "email",
    };

    await cognito.getUserAttributeVerificationCode(verificationParam).promise();

    const staffParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":email": data.newEmail,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #email = :email, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(staffParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Email has been successfully updated",
      data: response,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
