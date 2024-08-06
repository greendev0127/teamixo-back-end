import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();

const router = Router();

router.post("/create", async (req, res) => {
    try {
      const timeStamp = new Date().getTime();
      const data = req.body;
      if (!data) {
        return res.status(404).json({ statusCode: 404, message: "Bad Request" });
      }
  
      const record_table = "record_" + data.organizationId;
  
      const Item = {
        id: data.organizationId,
        email: data.email,
        state: "free",
        name: data.name,
        city: data.city,
        country: data.country,
        currency: data.currency,
        address: data.address,
        address_sec: data.address_sec,
        postcode: data.postCode,
        telephone: data.telePhone,
        organization_id: data.organizationId,
        timeZone: data.timeZone,
        logo: process.env.DEFAULT_COMPANY_LOGO,
        date_format: "DD-MM-YYYY",
        record_table: record_table,
        type: 1,
        round: 5,
        createAt: timeStamp,
        updateAt: timeStamp,
      };
  
      const companyCreateParams = {
        TableName: "company_list",
        Item,
      };
  
      const response = await dynamoDb.put(companyCreateParams).promise();
  
      return res.status(200).json({
        statusCode: 200,
        message: "success create",
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

export default router;
