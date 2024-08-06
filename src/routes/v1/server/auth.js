import AWS from "aws-sdk";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { GeneratePin } from "../utils";

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request" });
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

    const IdToken = response.AuthenticationResult.IdToken;
    const AccessToken = response.AuthenticationResult.AccessToken;

    const userInfo = jwt.decode(response.AuthenticationResult.IdToken);

    if (userInfo["custom:level"] == 3) {
      return res
        .status(404)
        .json({ message: "User has not permission to login server side." });
    }

    const userId = userInfo["custom:user_id"];

    const getUserParams = {
      TableName: "staff_list",
      Key: {
        id: userId,
      },
    };

    const userResult = await dynamoDb.get(getUserParams).promise();

    const user = userResult.Item;

    res.status(200).json({
      statusCode: 200,
      message: "Login succeed",
      user: user,
      token: IdToken,
      accessToken: AccessToken,
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(500).json(error);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(400).json({ statusCode: 400, error: "Bad Request" });
    }
    const { CLIENT_ID } = process.env;

    const userId = timeStamp.toString();

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
        {
          Name: "custom:organization_id",
          Value: userId,
        },
      ],
    };
    await cognito.signUp(params).promise();

    const pin = GeneratePin();

    var staffItems = {
      id: userId,
      organization_id: userId,
      email: data.email,
      name: data.fname,
      first_name: data.firstName,
      last_name: data.lastName,
      avatar: process.env.DEFAULT_AVATAR,
      pin: pin,
      role: "owner",
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
      response: staffItems,
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(500).json(error);
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request" });
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
    res.status(500).json({
      message: "Verification code is not correct",
      error: error,
    });
  }
});

router.post("/getMe", async (req, res) => {
  try {
    const data = req.body;

    console.log(data);
    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.userId,
      },
    };

    const user = await dynamoDb.get(params).promise();

    const response = {
      statusCode: 200,
      body: {
        user: user,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occured: ", error);
    return res.status(500).json(error);
  }
});

export default router;
