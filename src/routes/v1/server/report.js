import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/list", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const getReportParams = {
      TableName: data.tableName,
    };

    const result = await dynamoDb.scan(getReportParams).promise();

    return res.status(200).json({ statusCode: 200, body: result });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/add_track", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: "Bad Request!" });
    }

    const track_id = timeStamp;

    const promise = data.dateList.map(async (item, index) => {
      const uid = timeStamp + index;

      const dateParams = {
        TableName: data.tableName,
        Item: {
          id: uid.toString(),
          track_id: track_id,
          staff_id: data.staff.id,
          site_id: data.site.id,
          date: moment(item.start_date).format("YYYY-MM-DD"),
          start_date: item.start_date,
          end_date: item.end_date,
          total_time: item.total_time,
          name: data.staff.name,
          status: item.status,
          track_type: 1,
          createdAt: timeStamp,
          updateAt: timeStamp,
        },
      };
      await dynamoDb.put(dateParams).promise();
    });

    await Promise.all(promise);

    return res.status(200).json({
      statusCode: 200,
      message: `Track data has been successfully created`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ message: "Bad Request!" });
    }

    const params = {
      TableName: data.tableName,
      FilterExpression: "#track_id = :track_id",
      ExpressionAttributeNames: {
        "#track_id": "track_id",
      },
      ExpressionAttributeValues: {
        ":track_id": data.track_id, // Replace 'YourId' with the id you want to delete
      },
    };

    await queryAndDeleteDynamoDB(params);

    return res.status(200).json({
      statusCode: 200,
      message: "The report data has been deleted.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/get_track", async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const getTrackParams = {
      TableName: data.table_name,
      FilterExpression: "#track_id = :track_id",
      ExpressionAttributeNames: {
        "#track_id": "track_id",
      },
      ExpressionAttributeValues: {
        ":track_id": data.track_id,
      },
    };

    const tracks = await dynamoDb.scan(getTrackParams).promise();

    console.log(tracks);

    const getServiceParams = {
      TableName: "site_list",
      Key: {
        id: tracks.Items[0].site_id,
      },
    };

    const service = await dynamoDb.get(getServiceParams).promise();

    const getStaffParams = {
      TableName: "staff_list",
      Key: {
        id: tracks.Items[0].staff_id,
      },
    };

    const staff = await dynamoDb.get(getStaffParams).promise();

    return res.status(200).json({
      tracks: tracks.Items,
      service: service.Item,
      staff: staff.Item,
    });
  } catch (err) {
    console.log("Error is occurred: ", err);
    return res.status(500).json(err);
  }
});

router.post("/get_locations", async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    if (!data) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const getLocationParams = {
      TableName: "clock_location",
      Key: {
        id: data.id,
      },
    };

    const locationData = await dynamoDb.get(getLocationParams).promise();

    return res.status(200).json(locationData);
  } catch (error) {
    console.log("Error is occurred: ", error);
    return res.status(500).json(error);
  }
});

// ---------------------------------------------------

async function queryAndDeleteDynamoDB(params) {
  const data = await dynamoDb.scan(params).promise();
  for (let item of data.Items) {
    const deleteParams = {
      TableName: params.TableName,
      Key: {
        id: item.id,
      },
    };
    await dynamoDb.delete(deleteParams).promise();
  }
  if (data.LastEvaluatedKey) {
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    return queryAndDeleteDynamoDB(params);
  }
}

export default router;
