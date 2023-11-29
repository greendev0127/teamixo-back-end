import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/addlog", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const userParam = {
      TableName: "staff_list",
      Key: {
        id: data.userId,
      },
    };

    const user = await dynamoDb.get(userParam).promise();

    const TableName = "logs";

    let Item = data;
    Item.id = uuid.v1();
    Item.user = user.Item.name;
    Item.date = timeStamp;
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    delete Item.userId;

    const params = {
      TableName: TableName,
      Item,
    };

    const response = await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "success create",
      data: response,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetchlogs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "logs",
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

export default router;
