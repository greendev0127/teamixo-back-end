import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();

const router = Router();

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
    };

    const user = await dynamoDb.get(params).promise();

    const response = {
      statusCode: 200,
      body: {
        user: user,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#gender": "gender",
        "#birth": "birth",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":gender": data.gender,
        ":birth": data.birth,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #name_text = :name, #gender = :gender, #birth = :birth, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Profile data has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updateavatar", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let location = "";

    var buf = Buffer.from(
      data.avatar.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = data.avatar.split(";")[0].split("/")[1];
    const s3params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Avatars/${data.organization_id}/avatar${timeStamp}.${type}`,
      Body: buf,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    try {
      const uploadData = await s3bucket.upload(s3params).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return utils.responseData(200, { statusCode: 500, error });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#avatar": "avatar",
      },
      ExpressionAttributeValues: {
        ":avatar": location,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #avatar = :avatar, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      avatar: location,
      message: "Profile Avatar has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/changepin", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const staffParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#pin": "pin",
      },
      ExpressionAttributeValues: {
        ":pin": data.pin,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #pin = :pin, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };
    await dynamoDb.update(staffParams).promise();
    return res
      .status(200)
      .json({
        statusCode: 200,
        message: "Pin has been successfully updated",
        response,
      });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/gethistory", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const staffParams = {
      TableName: data.tableName,
      FilterExpression: "#staff_id = :staff_id",
      ExpressionAttributeNames: {
        "#staff_id": "staff_id",
      },
      ExpressionAttributeValues: {
        ":staff_id": data.userId,
      },
    };

    const staffHistoryList = await dynamoDb.scan(staffParams).promise();
    return res.status(200).json({ statusCode: 200, data: staffHistoryList });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
