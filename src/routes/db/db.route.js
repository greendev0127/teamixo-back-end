import AWS from "aws-sdk";
import { Router } from "express";

var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const router = Router();

router.post("/createtable", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: data.tableName,
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };

    await ddb.createTable(params).promise();

    res.status(200).json({ message: "Create table successful" });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});

router.post("/deletetable", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: data.tableName,
    };

    await ddb.deleteTable(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Delete table successful",
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});

export default router;
