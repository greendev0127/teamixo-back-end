import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/list", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const getReportParams = {
      TableName: data.tableName,
    };

    const result = await dynamoDb.scan(getReportParams).promise();

    return res.status(200).json({ statusCode: 200, body: result });
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
