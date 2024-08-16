import AWS from "aws-sdk";
import { Router } from "express";
import { UploadImage } from "../utils/upload-util";
import { TemporaryPasswordGenerator } from "../utils";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

const router = Router();

router.post("/fetch_staff", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the ID" });
    }

    const fetchParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
    };

    const user = await dynamoDb.get(fetchParams).promise();

    return res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/update_persional", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();

    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request: server can't find the update params!" });
    }

    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#full_name": "name",
        "#name_f": "first_name",
        "#name_m": "middle_name",
        "#name_l": "last_name",
        "#gender": "gender",
        "#birth": "birth",
        "#emergency_name": "emergency_name",
        "#emergency_employee": "emergency_employee",
        "#emergency_phone": "emergency_phone",
        "#address": "address",
        "#address_sec": "address_sec",
        "#city": "city",
        "#country": "country",
        "#postcode": "postcode",
        "#email": "email",
        "#email_sec": "email_sec",
        "#phone": "phone",
        "#phone_sec": "phone_sec",
      },
      ExpressionAttributeValues: {
        ":full_name": data.full_name,
        ":name_f": data.name_f,
        ":name_m": data.name_m,
        ":name_l": data.name_l,
        ":gender": data.gender,
        ":birth": data.birth,
        ":emergency_name": data.emergency_name,
        ":emergency_employee": data.emergency_employee,
        ":emergency_phone": data.emergency_phone,
        ":address": data.address,
        ":address_sec": data.address_sec,
        ":city": data.city,
        ":country": data.country,
        ":postcode": data.postcode,
        ":email": data.email,
        ":email_sec": data.email_sec,
        ":phone": data.phone,
        ":phone_sec": data.phone_sec,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #full_name = :full_name, #name_f = :name_f, #name_m = :name_m, #name_l = :name_l, #gender = :gender, #birth = :birth, #emergency_name = :emergency_name, #emergency_employee = :emergency_employee, #emergency_phone = :emergency_phone, #address = :address, #address_sec = :address_sec, #city = :city, #country = :country, #postcode = :postcode, #email = :email, #email_sec = :email_sec, #phone = :phone, #phone_sec = :phone_sec, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      message: "Staff personal information has been successfully updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/update_salary", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();

    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request: server can't find the update params!" });
    }

    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#salary": "salary",
      },
      ExpressionAttributeValues: {
        ":salary": data.salary,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #salary = :salary, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      message: "Staff persional information has been successfully updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/list", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request." });
    }

    const getParams = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
      },
    };

    const result = await dynamoDb.scan(getParams).promise();

    return res.status(200).json({ statusCode: 200, body: result.Items });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

router.post("/update_role", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#role_text": "role",
      },
      ExpressionAttributeValues: {
        ":role": data.department,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Update Successful",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const tempPassword = TemporaryPasswordGenerator();

    const params = {
      UserPoolId: process.env.USER_POOL_ID, // replace with your User Pool ID
      Username: data.email, // replace with the username
      TemporaryPassword: tempPassword, // replace with a temporary password
      UserAttributes: [
        {
          Name: "email",
          Value: data.email, // replace with the user's email
        },
        {
          Name: "email_verified",
          Value: "true",
        },
        {
          Name: "custom:role",
          Value: "member",
        },
        {
          Name: "custom:user_id",
          Value: timeStamp.toString(),
        },
        {
          Name: "custom:level",
          Value: "3",
        },
        {
          Name: "custom:organization_id",
          Value: data.organization_id,
        },
      ],
      MessageAction: "SUPPRESS", // suppresses the welcome message
    };
    await cognito.adminCreateUser(params).promise();

    const avatarUrl = await UploadImage(
      data.avatar,
      data.organization_id,
      timeStamp
    );

    let Item = data;
    Item.level = 3;
    Item.state = true;
    Item.avatar = avatarUrl;
    Item.break_state = false;
    Item.updateAt = timeStamp;
    Item.createAt = timeStamp;
    Item.clocked_state = false;
    Item.last_start_date = null;
    Item.password_state = false;
    Item.id = timeStamp.toString();

    const createStaffParams = {
      TableName: "staff_list",
      Item,
    };

    await dynamoDb.put(createStaffParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff has been successfully created.",
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});

export default router;
