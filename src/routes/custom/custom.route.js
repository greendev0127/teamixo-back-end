import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();

const router = Router();

router.post("/adddata", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let Item = {
      id: uuid.v1(),
      organization_id: data.organization_id,
      form_name: data.form_name,
      form_id: data.form_id,
      allocate_id: data.allocate_id,
      sender: data.sender,
      sender_type: data.sender_type,
      form_result: data.form_result,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "custom_data",
      Item,
    };

    const result = await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: `${form_name} form have been created successfully!`,
      data: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetchdata", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "custom_data",
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
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
