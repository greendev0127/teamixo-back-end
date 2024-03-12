import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();

const router = Router();

router.post("/upload", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const file = data.file;
    const base64Data = file.replace(/^data:application\/pdf;base64,/, "");
    const decodedFile = Buffer.from(base64Data, "base64");
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Document/${data.organizationId}/${moment(timeStamp).format(
        "YYYY-MM-DD"
      )}/${data.docName}_${timeStamp}.pdf`,
      Body: decodedFile,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `application/pdf`,
    };
    let location = "";
    try {
      const uploadData = await s3bucket.upload(params).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return res.status(200).json({ statusCode: 500, error });
    }
    return res.status(200).json({ statusCode: 200, data: location });
  } catch (error) {
    res.status(200).json(error);
  }
});

router.post("/add", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let Item = data;
    Item.id = timeStamp.toString();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;

    const params = {
      TableName: "documents",
      Item,
    };

    await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Document has been successfully created",
    });
  } catch (error) {
    res.status(200).json(error);
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
      TableName: "documents",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#docName": "docName",
        "#docType": "docType",
        "#docDate": "docDate",
        "#expireDate": "expireDate",
        "#assignType": "assignType",
        "#assignValue": "assignValue",
      },
      ExpressionAttributeValues: {
        ":docName": data.docName,
        ":docType": data.docType,
        ":docDate": data.docDate,
        ":expireDate": data.expireDate,
        ":assignType": data.assignType,
        ":assignValue": data.assignValue,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #docName = :docName, #docType = :docType, #docDate = :docDate, #expireDate = :expireDate, #assignType = :assignType, #assignValue = :assignValue, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully updated",
    });
  } catch (error) {
    res.status(200).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // replace with your bucket name
      Key: data.key, // replace with the image key
    };

    await s3bucket.deleteObject(params).promise();

    const documentParams = {
      TableName: "documents",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(documentParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "delete successful",
    });
  } catch (error) {
    res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const params = {
      TableName: "documents",
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
    res.status(200).json(error);
  }
});

router.post("/staff", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "documents",
      FilterExpression:
        "#organization_id = :organization_id AND #assignType < :assignType",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#assignType": "assignType",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":assignType": 5,
      },
    };

    const result = await dynamoDb.scan(params).promise();
    const resultDocList = result.Items.filter((item) => {
      return (
        item.assignType === 1 ||
        (item.assignType === 2 && item.assignValue === data.type) ||
        (item.assignType === 3 && data.role.includes(item.assignValue)) ||
        data.userId === item.assignValue
      );
    });
    return res.status(200).json({
      statusCode: 200,
      body: resultDocList,
    });
  } catch (error) {
    res.status(200).json(error);
  }
});

router.post("/site", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "documents",
      FilterExpression:
        "#organization_id = :organization_id AND #assignType > :assignType",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#assignType": "assignType",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":assignType": 4,
      },
    };

    const result = await dynamoDb.scan(params).promise();
    const resultDocList = result.Items.filter((item) => {
      return item.assignType === 5 || data.sietId === item.assignValue;
    });
    return res.status(200).json({
      statusCode: 200,
      body: resultDocList,
    });
  } catch (error) {
    res.status(200).json(error);
  }
});

export default router;
