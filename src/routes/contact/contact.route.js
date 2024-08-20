import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
var ses = new AWS.SES();

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
    Item.id = timeStamp.toString();
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

router.post("/sendemail", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    var emailParams = {
      Destination: {
        ToAddresses: ["support@teamixo.com"], // replace recipient@example.com with the recipient's email address
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<div>
              <p>Name: ${data.name}</p>
              <p>Email Address: ${data.email}</p>
              <p>Content: ${data.content}</p>
            </div>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Support request`, // replace with your email subject
        },
      },
      Source: "Teamixo Support <contact@teamixo.com>", // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Contact email is sent to support team",
    });
  } catch (error) {
    return res.status(200).json({ statusCode: 500, error: error });
  }
});

router.post("/join-to-list", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const Item = data;
    Item.id = timeStamp.toString();
    Item.createdAt = timeStamp;
    Item.updatedAt = timeStamp;

    const createParams = {
      TableName: "waitList",
      Item,
    };

    await dynamoDb.put(createParams).promise();

    return res
      .status(200)
      .json({ message: "Join request has been successfully added" });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

router.get("/get-join-list", async (req, res) => {
  try {
    const fetchParmas = {
      TableName: "waitList",
    };

    const joinListData = await dynamoDb.scan(fetchParmas).promise();

    return res.status(200).json({ data: joinListData });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

export default router;
