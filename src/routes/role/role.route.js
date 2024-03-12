import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      role: data.roleName,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "role_list",
      Item,
    };

    await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully created",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
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
        ":organization_id": data.organization_id,
      },
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "role_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#role_text": "role",
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "role_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/staffrole", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#role_text": "role",
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Update Successful",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
