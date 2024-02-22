import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let Item = data;
    Item.id = uuid.v1();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;

    const params = {
      TableName: "site_list",
      Item,
    };

    await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully created",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
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

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#description_text": "description",
        "#round": "round",
        "#radius": "radius",
        "#remote": "remote",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":description": data.description,
        ":round": data.round,
        ":radius": data.radius,
        ":remote": data.remote,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #name_text = :name, #description_text = :description, #round = :round, #radius = :radius, #remote = :remote, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/location", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#lat": "lat",
        "#lng": "lng",
        "#address": "address",
      },
      ExpressionAttributeValues: {
        ":lat": data.lat,
        ":lng": data.lng,
        ":address": data.address,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #lat = :lat, #lng = :lng, #address = :address, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Location data has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Site data had been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/settime", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#siteClockInTime": "siteClockInTime",
      },
      ExpressionAttributeValues: {
        ":siteClockInTime": data.siteClockInTime,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #siteClockInTime = :siteClockInTime, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParams).promise();

    return res
      .status(200)
      .json({ statusCode: 200, message: "Site clock in time is setted." });
  } catch (error) {
    return res.status(200).json({ statusCode: 500, error: error });
  }
});

export default router;
