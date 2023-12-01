import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/addticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const TableName = "support";

    let Item = data;
    Item.id = uuid.v1();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;

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

router.post("/getticket", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "support",
      Key: {
        id: data.id,
      },
    };

    const res = await dynamoDb.get(params).promise();

    const response = {
      statusCode: 200,
      body: res,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/solveticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "support",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#solved": "solved",
      },
      ExpressionAttributeValues: {
        ":solved": true,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #solved = :solved, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    const message = "#" + data.id + " ticket is closed";

    return res.status(200).json({
      statusCode: 200,
      message: message,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updateticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "support",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#messages": "messages",
      },
      ExpressionAttributeValues: {
        ":messages": data.messages,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #messages = :messages, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    const message = "#" + data.id + " ticket is closed.";

    return res.status(200).json({
      statusCode: 200,
      message: message,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.get("/fetchtickets", async (req, res) => {
  try {
    const params = {
      TableName: "support",
    };
    const ticketData = await dynamoDb.scan(params).promise();
    return res.status(200).json({ statusCode: 200, data: ticketData });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetchticket", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "support",
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
