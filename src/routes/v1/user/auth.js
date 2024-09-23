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

export default router;
