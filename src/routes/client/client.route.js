import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment";
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

    const uid = timeStamp.toString();

    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        workPosition: data.workPosition,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
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
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date",
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.tableName,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
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

router.post("/break", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }
    //calculate the total time from start work to start break
    var differenceInMs =
      roundToNearestFiveMinutes(timeStamp, data.round) -
      data.staff.last_start_date;

    var total_time = differenceInMs;

    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id,
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

    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        workPosition: data.workPosition,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "break",
        createdAt: timeStamp,
        updateAt: timeStamp,
      },
    };

    await dynamoDb.put(addParams).promise();

    // update user with break state
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date",
      },
      ExpressionAttributeValues: {
        ":break_state": true,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

router.post("/restart", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }
    //calculate the total time from start work to start break
    var differenceInMs =
      roundToNearestFiveMinutes(timeStamp, data.round) -
      data.staff.last_start_date;

    var total_time = differenceInMs;

    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id,
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

    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "restart",
        createdAt: timeStamp,
        updateAt: timeStamp,
      },
    };

    await dynamoDb.put(addParams).promise();

    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date",
      },
      ExpressionAttributeValues: {
        ":break_state": false,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
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
    //calculate the total time from start work to start break
    var differenceInMs =
      roundToNearestFiveMinutes(timeStamp, data.round) -
      data.staff.last_start_date;

    var total_time = differenceInMs;

    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id,
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

    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        total_time: 0,
        name: data.staff.name,
        status: "end",
        createdAt: timeStamp,
        updateAt: timeStamp,
      },
    };

    await dynamoDb.put(addParams).promise();

    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date",
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":break_state": false,
        ":record_id": null,
        ":site_id": null,
        ":last_start_date": null,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #clocked_state = :clocked_state, #break_state = :break_state, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
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

    const uid = timeStamp.toString();
    const staff_id = timeStamp.toString();

    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: staff_id,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.name,
        status: "start",
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
      record_id: uid,
      type: 1,
      level: 3,
      clocked_state: true,
      break_state: false,
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
