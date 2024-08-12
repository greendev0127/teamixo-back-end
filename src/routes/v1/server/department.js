import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/list", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request." });
    }

    const getParams = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
      },
    };

    const result = await dynamoDb.scan(getParams).promise();

    return res.status(200).json({ statusCode: 200, body: result.Items });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

router.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      role: data.department,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const createParams = {
      TableName: "role_list",
      Item,
    };

    await dynamoDb.put(createParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "New department has been successfully created",
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
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
        ":role": data.department,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Department has been successfully updated",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const deleteDepartmentParams = {
      TableName: "role_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(deleteDepartmentParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Department data has been successfilly deleted.",
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});

export default router;
