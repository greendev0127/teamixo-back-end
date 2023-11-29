import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/report", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const params = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#site_report": "site_report",
        "#staff_report": "staff_report",
        "#show_day": "show_day",
      },
      ExpressionAttributeValues: {
        ":site_report": data.site_report,
        ":staff_report": data.staff_report,
        ":show_day": data.showDay,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #site_report = :site_report, #staff_report = :staff_report, #show_day = :show_day, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Report option data has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
