import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request!" });
    }

    const { password, email, name } = data;

    const signUpParams = {
      ClientId: process.env.ADMIN_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
      ],
    };

    const signUpResponse = await cognito.signUp(signUpParams).promise();

    return res.status(200).json({
      message: "User signed up successfully",
      user: signUpResponse.UserSub,
    });
  } catch (err) {
    console.log("Error signing up user:", err);
    return res.status(500).json({ message: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request!" });
    }

    const { password, email } = data;

    const signInParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.ADMIN_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const signInResponse = await cognito.initiateAuth(signInParams).promise();

    return res.status(200).json({
      message: "User signed in successfully",
      accessToken: signInResponse.AuthenticationResult.AccessToken,
      idToken: signInResponse.AuthenticationResult.IdToken,
    });
  } catch (err) {
    console.log("Error signing up user:", err);
    return res.status(500).json({ message: err.message });
  }
});

router.post("/confirmSignUp", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request!" });
    }

    const { verificationCode, email } = data;

    const confirmSignUpParams = {
      ClientId: process.env.ADMIN_CLIENT_ID,
      Username: email,
      ConfirmationCode: verificationCode,
    };

    await cognito.confirmSignUp(confirmSignUpParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Email address confirmed successfully",
    });
  } catch (err) {
    console.log("Error confirming email address:", err);
    return res.status(500).json({ message: err.message });
  }
});

router.get("/getUser", async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];

    const getUserParams = {
      AccessToken: accessToken,
    };

    const user = await cognito.getUser(getUserParams).promise();

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error retrieving user:", err);

    return res.status(500).json({ message: err.message });
  }
});

router.get("/fetchdata", async (req, res) => {
  try {
    const fetchUserParams = {
      TableName: "staff_list",
    };

    const staffData = await dynamoDb.scan(fetchUserParams).promise();

    const fetchSiteParams = {
      TableName: "site_list",
    };

    const siteData = await dynamoDb.scan(fetchSiteParams).promise();

    const fetchCompanyParams = {
      TableName: "company_list",
    };

    const companyData = await dynamoDb.scan(fetchCompanyParams).promise();

    return res.status(200).json({
      statusCode: 200,
      data: {
        staffData: staffData,
        siteData,
        siteData,
        companyData,
        companyData,
      },
    });
  } catch (err) {
    console.log("error", err);
    return res.status(404).json(error);
  }
});

router.get("/companies", async (req, res) => {
  try {
    const companyParams = {
      TableName: "company_list",
    };

    const companyData = await dynamoDb.scan(companyParams).promise();

    const orgParams = {
      TableName: "organization",
    };

    const orgData = await dynamoDb.scan(orgParams).promise();

    return res.status(200).json({
      statusCode: 200,
      data: {
        companyData: companyData,
        orgData: orgData,
      },
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/deleteowner", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const orgParam = {
      TableName: "organization",
      Key: {
        id: data.orgId,
      },
    };

    await dynamoDb.delete(orgParam).promise();

    const companyParam = {
      TableName: "company_list",
      Key: {
        id: data.companyId,
      },
    };

    await dynamoDb.delete(companyParam).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Owner data has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/deletesites", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId, // Replace 'YourId' with the id you want to delete
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const item of scanResults) {
      const params = {
        TableName: item.table_name,
      };

      await ddb.deleteTable(params).promise();
      const deleteParams = {
        TableName: "site_list",
        Key: {
          id: item.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Sites data has been successfully deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/deleterole", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId, // Replace 'YourId' with the id you want to delete
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const item of scanResults) {
      const deleteParams = {
        TableName: "role_list",
        Key: {
          id: item.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/deletestaffs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId, // Replace 'YourId' with the id you want to delete
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const item of scanResults) {
      const userParam = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: item.email,
      };

      await cognito.adminDeleteUser(userParam).promise();

      const deleteParams = {
        TableName: "staff_list",
        Key: {
          id: item.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/deletedocs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "documents",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId, // Replace 'YourId' with the id you want to delete
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const item of scanResults) {
      const urlParts = new URL(item.docFile).pathname.split("/");
      const key = urlParts.slice(1).join("/").replaceAll("%20", " ");

      const params = {
        Bucket: process.env.S3_BUCKET_NAME, // replace with your bucket name
        Key: key, // replace with the image key
      };

      await s3bucket.deleteObject(params).promise();

      const deleteParams = {
        TableName: "documents",
        Key: {
          id: item.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
