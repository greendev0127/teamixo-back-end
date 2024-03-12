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

    console.log(data);

    const updateParams = {
      TableName: "company_list",
      Key: { id: data.organizationId }, // Assuming 'id' is the primary key
      UpdateExpression:
        "set #name = :name, organization_id = :orgId, city = :city, country = :country, address = :address, address_sec = :addressSec, postcode = :postcode, telephone = :telephone, email = :email, country_state = :state, #timeZone = :timeZone, logo = :logo, date_format = :dateFormat, #type = :type, round = :round, updateAt = :updateAt",
      ExpressionAttributeNames: {
        "#name": "name", // Placeholder for reserved keyword
        "#timeZone": "timeZone",
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":orgId": data.organizationId,
        ":name": data.name,
        ":city": data.city,
        ":country": data.country,
        ":address": data.address,
        ":addressSec": data.address_sec,
        ":postcode": data.postCode,
        ":telephone": data.telePhone,
        ":email": data.email,
        ":state": data.state,
        ":timeZone": data.timeZone,
        ":logo": process.env.DEFAULT_COMPANY_LOGO, // Typo in original code: COMAPNY -> COMPANY
        ":dateFormat": "YYYY-MM-DD",
        ":type": 1,
        ":round": 5,
        ":updateAt": timeStamp,
      },
      ReturnValues: "UPDATED_NEW",
    };

    const response = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "success create",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
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

    const result = await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully updated",
      data: location,
      response: result,
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

router.post("/updatelogo", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    let location = "";

    var buf = Buffer.from(
      data.logo.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = data.logo.split(";")[0].split("/")[1];
    const imageParam = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Logos/${data.organization_id}/${timeStamp}.${type}`,
      Body: buf,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    try {
      const uploadData = await s3bucket.upload(imageParam).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return res.status(200).json({ statusCode: 500, error });
    }

    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#logo": "logo",
      },
      ExpressionAttributeValues: {
        ":logo": location,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #logo = :logo, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company Logo has been successfully updated",
      location: location,
      response: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updatename", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #name = :name, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updatesettings", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#rdname": "rdname",
        "#break": "break",
        "#timeZone": "timeZone",
        "#date_format": "date_format",
        "#type": "type",
        "#round": "round",
      },
      ExpressionAttributeValues: {
        ":rdname": data.rdname,
        ":break": data.break,
        ":timeZone": data.timeZone,
        ":date_format": data.date_format,
        ":type": data.type,
        ":round": data.round,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #rdname = :rdname, #break = :break, #timeZone = :timeZone, #date_format = :date_format, #type = :type, #round = :round, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updatecontact", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#email": "email",
        "#telephone": "telephone",
      },
      ExpressionAttributeValues: {
        ":email": data.email,
        ":telephone": data.telephone,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #email = :email, #telephone = :telephone, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/updateForm", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#form": "form",
      },
      ExpressionAttributeValues: {
        ":form": data.form,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #form = :form, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company Form has been successfully updated",
      response: result,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});

export default router;
