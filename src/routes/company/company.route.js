import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    let Item = {
      id: uuid.v1(),
      organization_id: data.organizationId,
      name: data.name,
      description: data.description,
      logo: "https://saas-app-development.s3.eu-west-2.amazonaws.com/Home/Logos/default/default_1695705510183.png",
      date_format: "YYYY-MM-DD",
      timeZone: "Etc/GMT",
      type: 1,
      round: 5,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "company_list",
      Item,
    };

    await dynamoDb.put(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "success create",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    console.log("11111111111", data);
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "company_list",
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

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    let location = "";

    if (data.logo) {
      var buf = Buffer.from(
        data.logo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const type = data.logo.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Logos/${data.name}/${data.name}_${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({ statusCode: 500, error });
      }
    }

    const params = data.logo
      ? {
          TableName: "company_list",
          Key: {
            id: data.id,
          },
          ExpressionAttributeNames: {
            "#name_text": "name",
            "#rdname": "rdname",
            "#logo": "logo",
            "#date_format": "date_format",
            "#timeZone": "timeZone",
            "#type": "type",
            "#round": "round",
          },
          ExpressionAttributeValues: {
            ":name": data.name,
            ":rdname": data.rdname,
            ":logo": location,
            ":date_format": data.dateFormat,
            ":timeZone": data.timeZone,
            ":type": data.type,
            ":round": data.round,
            ":updateAt": timeStamp,
          },
          UpdateExpression:
            "SET #name_text = :name, #rdname = :rdname, #logo = :logo, #date_format = :date_format, #timeZone = :timeZone, #type = :type, #round = :round, updateAt = :updateAt",
          ReturnValues: "ALL_NEW",
        }
      : {
          TableName: "company_list",
          Key: {
            id: data.id,
          },
          ExpressionAttributeNames: {
            "#name_text": "name",
            "#rdname": "rdname",
            "#date_format": "date_format",
            "#timeZone": "timeZone",
            "#type": "type",
            "#round": "round",
          },
          ExpressionAttributeValues: {
            ":name": data.name,
            ":rdname": data.rdname,
            ":date_format": data.dateFormat,
            ":timeZone": data.timeZone,
            ":type": data.type,
            ":round": data.round,
            ":updateAt": timeStamp,
          },
          UpdateExpression:
            "SET #name_text = :name, #rdname = :rdname, #date_format = :date_format, #timeZone = :timeZone, #type = :type, #round = :round, updateAt = :updateAt",
          ReturnValues: "ALL_NEW",
        };

    const res = await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully updated",
      data: location,
      response: res,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/state", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const organizationParams = {
      TableName: "organization",
      Key: {
        id: data.organization_id,
      },
      ExpressionAttributeNames: {
        "#update_state": "update_state",
      },
      ExpressionAttributeValues: {
        ":update_state": true,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #update_state = :update_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(organizationParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "success create",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/getcompany", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const companyParams = {
      TableName: "company_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
      },
    };

    const company = await dynamoDb.scan(companyParams).promise();

    const response = {
      statusCode: 200,
      body: company,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
