import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment";
import { roundToNearestFiveMinutes } from "../utils/clock-utils";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/start", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request!" });
    }

    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
    };

    const checkResult = await dynamoDb.get(checkParams).promise();

    if (checkResult.Item.clock_state) {
      return res.status(400).json({
        message: "This staff already clocked in",
      });
    }

    const uid = timeStamp.toString();

    const createTrackParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        site_id: data.siteId,
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

    await dynamoDb.put(createTrackParams).promise();

    if(data.workPosition) {
      const newLocation = []
      const updateWorkPosition = {
        ...data.workPosition,
        time: timeStamp
      }
      newLocation.push(updateWorkPosition)
  
      const createLocationParam = {
        TableName: 'clock_location',
        Item: {
          id: uid,
          locations: newLocation,
          createdAt: timeStamp,
          updateAt: timeStamp,
        }
      }
  
      await dynamoDb.put(createLocationParam).promise()
    }

    const updateStaffParams = {
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
        ":site_id": data.siteId,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(updateStaffParams).promise();

    return res.status(200).json({ message: "New track has been created." });
  } catch (error) {
    console.log(error)
    return res.status(500).json(error);
  }
});

router.post("/end-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id,
      },
    };

    const checkResult = await dynamoDb.get(checkParams).promise();

    if (!checkResult.Item.clocked_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff doesn't clock in yet.",
      });
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
        site_id: data.siteId,
        date: moment(timeStamp).format("YYYY-MM-DD"),
        workPosition: data.workPosition,
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

router.post("/update_location", async (req, res) => {
  try {
    const timeStamp = new Date().getTime()
    const data = req.body
    console.log(data)

    if(!data) {
      return res.status(400).json({message: "Bad Request"})
    }

    const updateWorkPosition = {
      ...data.location,
      time: timeStamp
    }

    const updateLocationParams = {
      TableName: 'clock_location',
      Key: {
        id: data.id
      },
      UpdateExpression: "SET #loc = list_append(#loc, :newValue), updateAt = :updateAt",
      ExpressionAttributeNames:{
          "#loc": "locations"
      },
      ExpressionAttributeValues:{
          ":newValue": [updateWorkPosition],
          ":updateAt": timeStamp,
      },
      ReturnValues:"UPDATED_NEW"
    }

    const locations = await dynamoDb.update(updateLocationParams).promise()

    return res.status(200).json({data: locations})
  } catch (error) {
    console.log("Error is occurred in update locations: ", error)
    return res.status(500).json(error)
  }
})

export default router;
