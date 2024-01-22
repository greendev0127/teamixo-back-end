import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();

const router = Router();

router.post("/newform", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    let Item = {
      id: uuid.v1(),
      organization_id: data.organization_id,
      form_name: data.form_name,
      submit_label: data.submit_label,
      form_elements: data.form_elements,
      color: data.color,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "form_list",
      Item,
    };

    await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: `${form_name} form have been created successfully!`,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updateform", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const updateParam = {
      TableName: "form_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#form_name": "form_name",
        "#submit_label": "submit_label",
        "#form_elements": "form_elements",
        "#color": "color",
      },
      ExpressionAttributeValues: {
        ":form_name": data.form_name,
        ":submit_label": data.submit_label,
        ":form_elements": data.form_elements,
        ":color": data.color,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #form_name = :form_name, #submit_label = :submit_label, #form_elements = :form_elements, #color = :color, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParam).promise();

    return res
      .status(200)
      .json({ statusCode: 200, message: "Allocate Form Success" });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "form_list",
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
      body: result,
    };

    return res.status(200).json(response);
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

    const delete_param = {
      TableName: "form_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(delete_param).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Form has been removed successfully",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/allocate", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const allocateParam = {
      TableName: "form_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#allocated_site": "allocated_site",
        "#allocated_staff": "allocated_staff",
      },
      ExpressionAttributeValues: {
        ":allocated_site": data.allocated_site,
        ":allocated_staff": data.allocated_staff,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #allocated_site = :allocated_site, #allocated_staff = :allocated_staff, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(allocateParam).promise();

    return res
      .status(200)
      .json({ statusCode: 200, message: "Allocate Form Success" });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.get("/test", async (req, res) => {
  try {
    const params = {
      TableName: "form_list",
    };

    const data = await dynamoDb.scan(params).promise();
    return res.status(200).json({ data: data });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;

  const base64Data = req.body.base.split("base64,")[1];
  const decodedFile = Buffer.from(base64Data, "base64");

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "Home/Form/File/" + req.file.originalname, // Use the original file name
    Body: decodedFile,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: file.mimetype,
  };

  try {
    const data = await S3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return res
      .status(200)
      .json({ data: data.Location, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res
      .status(200)
      .json({ statusCode: 500, message: "Error uploading file" });
  }
});

router.post("/uploadphoto", async (req, res) => {
  const timeStamp = new Date().getTime();
  const photo = req.body.photo.split("base64,")[1];

  const decodedFile = Buffer.from(photo, "base64");

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "Home/Form/Photo/" + timeStamp, // Use the original file name
    Body: decodedFile,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };

  try {
    const data = await S3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return res
      .status(200)
      .json({ data: data.Location, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res
      .status(200)
      .json({ statusCode: 500, message: "Error uploading file" });
  }
});

router.post("/getuserform", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "contains(allocated_staff, :allocate_id)",
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id,
      },
    };

    const result = await dynamoDb.scan(fetchParam).promise();

    const response = {
      statusCode: 200,
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/getsiteform", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "contains(allocated_site, :allocate_id)",
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id,
      },
    };

    const result = await dynamoDb.scan(fetchParam).promise();

    const response = {
      statusCode: 200,
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/getforms", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "#allocate_id = :allocate_id",
      ExpressionAttributeNames: {
        "#allocate_id": "allocate_id",
      },
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id,
      },
    };

    const result = await dynamoDb.scan(fetchParam).promise();

    const response = {
      statusCode: 200,
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/addformdata", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let Item = {
      id: uuid.v1(),
      organization_id: data.organization_id,
      form_name: data.form_name,
      form_id: data.form_id,
      allocate_id: data.allocate_id,
      sender_type: data.sender_type,
      form_result: data.form_result,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "form_list",
      Item,
    };

    const result = await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: `${form_name} form have been created successfully!`,
      data: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
