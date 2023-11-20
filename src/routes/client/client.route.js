import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment"
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

function roundToNearestFiveMinutes(date, round) {
  const ms = 1000 * 60 * round; // convert 5 minutes to milliseconds
  const roundedDate = new Date(Math.round(date / ms) * ms);
  return roundedDate.getTime();
}

router.post("/getsite", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const params = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
    };

    const site = await dynamoDb.get(params).promise();

    const companyParams = {
      TableName: "company_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": site.Item.organization_id,
      },
    };

    const company = await dynamoDb.scan(companyParams).promise();

    const response = {
      statusCode: 200,
      body: {
        site: site,
        company: company,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/stafflist", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const params = {
      TableName: "staff_list",
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

router.post("/trigger", async (req, res) => {
  try {
		const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const params = {
      TableName: "organization",
      Key: {
        id: data.id,
      },
    };

    const result = await dynamoDb.get(params).promise();

    if (result.Item.update_state) {
      const siteParams = {
        TableName: "organization",
        Key: {
          id: data.id,
        },
        ExpressionAttributeNames: {
          "#update_state": "update_state",
        },
        ExpressionAttributeValues: {
          ":update_state": false,
          ":updateAt": timeStamp,
        },
        UpdateExpression:
          "SET #update_state = :update_state, updateAt = :updateAt",
        ReturnValues: "ALL_NEW",
      };

      await dynamoDb.update(siteParams).promise();
    }

    const response = {
      statusCode: 200,
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/start", async (req, res) => {
  try {
		const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const uid = uuid.v1();

    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        staff_id: data.staff.id,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        date: moment(timeStamp).format("YYYY-MM-DD"),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        createdAt: timeStamp,
        updateAt: timeStamp,
      },
    };

    await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#track_id": "track_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date",
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":track_id": uid,
        ":site_id": data.tableName,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #clocked_state = :clocked_state, #track_id = :track_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(params).promise();

    const response = {
      stsatusCode: 200,
      body: result.Attributes,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/end", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    var differenceInMs =
      roundToNearestFiveMinutes(timeStamp, data.round) -
      data.staff.last_start_date;

    var total_time = differenceInMs;

    const dateParam = {
      TableName: data.tableName,
      Key: {
        id: data.staff.track_id,
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time",
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(dateParam).promise();

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #clocked_state = :clocked_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(params).promise();

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/check", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
    };

    const result = await dynamoDb.get(params).promise();

    const response = {
      statusCode: 200,
      body: result,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/addstaff", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const uid = uuid.v1();
    const staff_id = uuid.v1();

    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        staff_id: staff_id,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        date: moment(timeStamp).format("YYYY-MM-DD"),
        end_date: null,
        total_time: null,
        name: data.name,
        createdAt: timeStamp,
        updateAt: timeStamp,
      },
    };

    await dynamoDb.put(dateParams).promise();

    let Item = {
      id: staff_id,
      organization_id: data.organization_id,
      name: data.name,
      email: data.email,
      avatar: process.env.DEFAULT_AVATAR,
      site_id: data.tableName,
      track_id: uid,
      type: 1,
      level: 3,
      clocked_state: true,
      last_start_date: roundToNearestFiveMinutes(timeStamp, data.round),
      state: false,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      TableName: "staff_list",
      Item,
    };

    await dynamoDb.put(params).promise();

    const response = {
      stsatusCode: 200,
      message: "success",
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
