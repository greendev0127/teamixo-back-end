import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(404).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organizationId,
      },
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occured: ", error);
    return res.status(500).json(error);
  }
});

export default router;
