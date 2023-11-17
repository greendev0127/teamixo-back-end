import AWS from "aws-sdk";
import { Router } from "express";

var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const router = Router();

router.post("/", async (req, res) => {
  try {
    const data = JSON.parse(req.body);

    const params = {
      TableName: data.tableName,
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      BillingMode: "PAY_PER_REQUEST",
    };

    await ddb.createTable(params).promise();

    res.status(200).json({ message: "Create table successful" });
  } catch (error) {
    res.status(200).json(error);
  }
});
