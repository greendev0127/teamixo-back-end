import AWS from "aws-sdk";
import { Router } from "express";
import moment from "moment";
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();

const router = Router();

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

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: data.tableName,
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

router.post("/scandate", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: data.tableName,
      FilterExpression: "#date between :start_date and :end_date",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":start_date": data.start_date,
        ":end_date": data.end_date,
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

// router.post("/addtrack", async (req, res) => {
//   try {
//     const timeStamp = new Date().getTime();
//     const data = req.body;
//     if (!data) {
//       return res.status(200).json({ statusCode: 400, message: "Bad Request" });
//     }

//     const TableName = data.tableName;
//     let site_id = data.site_id;
//     let last_start_date = data.last_start_date;
//     let track_id = data.track_id;
//     const clocked_state = data.state;

//     let Item = data;
//     Item.id = uuid.v1();
//     Item.createdAt = timeStamp;
//     Item.updateAt = timeStamp;
//     Item.edit_state = 2;
//     delete Item.tableName;
//     delete Item.siteId;
//     delete Item.track_id;
//     delete Item.last_start_date;
//     delete Item.state;
//     delete Item.site_id;

//     const params = {
//       TableName: TableName,
//       Item,
//     };

//     await dynamoDb.put(params).promise();

//     var state = clocked_state;
//     if (Item.end_date === null) {
//       track_id = Item.id;
//       last_start_date = data.start_date;
//       state = true;
//       site_id = TableName;
//     }

//     const staffParams = {
//       TableName: "staff_list",
//       Key: {
//         id: data.staff_id,
//       },
//       ExpressionAttributeNames: {
//         "#clocked_state": "clocked_state",
//         "#track_id": "track_id",
//         "#site_id": "site_id",
//         "#last_start_date": "last_start_date",
//       },
//       ExpressionAttributeValues: {
//         ":clocked_state": state,
//         ":track_id": track_id,
//         ":site_id": site_id,
//         ":last_start_date": last_start_date,
//         ":updateAt": timeStamp,
//       },
//       UpdateExpression:
//         "SET #track_id = :track_id, #last_start_date = :last_start_date, #clocked_state = :clocked_state, #site_id = :site_id, updateAt = :updateAt",
//       ReturnValues: "ALL_NEW",
//     };

//     await dynamoDb.update(staffParams).promise();

//     return res.status(200).json({
//       statusCode: 200,
//       message: `${Item.name} track data has been successfully created`,
//     });
//   } catch (error) {
//     return res.status(200).json(error);
//   }
// });

router.post("/addtrack", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }

    const track_id = uuid.v1();

    const promise = data.dateList.map(async (item, index) => {
      const uid = uuid.v1();

      const dateParams = {
        TableName: data.tableName,
        Item: {
          id: uid,
          track_id: track_id,
          staff_id: data.staff.id,
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
      message: `${data.staff.name} track data has been successfully created`,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});

// router.post("/updatetrack", async (req, res) => {
//   try {
//     const timeStamp = new Date().getTime();
//     const data = req.body;
//     if (!data) {
//       return res.status(200).json({ statusCode: 400, message: "Bad Request" });
//     }

//     const dateParam = {
//       TableName: data.tableName,
//       Key: {
//         id: data.id,
//       },
//       ExpressionAttributeNames: {
//         "#name": "name",
//         "#staff_id": "staff_id",
//         "#date": "date",
//         "#start_date": "start_date",
//         "#end_date": "end_date",
//         "#start_origin": "start_origin",
//         "#end_origin": "end_origin",
//         "#total_time": "total_time",
//       },
//       ExpressionAttributeValues: {
//         ":name": data.name,
//         ":staff_id": data.staff_id,
//         ":date": data.date,
//         ":start_date": data.start_date,
//         ":end_date": data.end_date,
//         ":start_origin": data.start_origin,
//         ":end_origin": data.end_origin,
//         ":total_time": data.total_time,
//         ":edit_state": 1,
//         ":updateAt": timeStamp,
//       },
//       UpdateExpression:
//         "SET #name = :name, #staff_id = :staff_id, #date = :date, #start_date = :start_date, #end_date = :end_date, #start_origin = :start_origin, #end_origin = :end_origin, #total_time = :total_time, edit_state = :edit_state, updateAt = :updateAt",
//       ReturnValues: "ALL_NEW",
//     };

//     await dynamoDb.update(dateParam).promise();

//     if (data.state) {
//       if (!data.subState) {
//         const oldParams = {
//           TableName: "staff_list",
//           Key: {
//             id: data.old_staff_id,
//           },
//           ExpressionAttributeNames: {
//             "#clocked_state": "clocked_state",
//           },
//           ExpressionAttributeValues: {
//             ":clocked_state": false,
//           },
//           UpdateExpression: "SET #clocked_state = :clocked_state",
//           ReturnValues: "ALL_NEW",
//         };

//         await dynamoDb.update(oldParams).promise();

//         const params = {
//           TableName: "staff_list",
//           Key: {
//             id: data.staff_id,
//           },
//           ExpressionAttributeNames: {
//             "#clocked_state": "clocked_state",
//             "#last_start_date": "last_start_date",
//             "#track_id": "track_id",
//             "#site_id": "site_id",
//           },
//           ExpressionAttributeValues: {
//             ":clocked_state": data.clocked_state,
//             ":last_start_date": data.start_date,
//             ":track_id": data.id,
//             ":updateAt": timeStamp,
//             ":site_id": data.tableName,
//           },
//           UpdateExpression:
//             "SET #last_start_date = :last_start_date, #clocked_state = :clocked_state, #track_id = :track_id, #site_id = :site_id, updateAt = :updateAt",
//           ReturnValues: "ALL_NEW",
//         };

//         await dynamoDb.update(params).promise();
//       } else {
//         if (data.clocked_state) {
//           const params = {
//             TableName: "staff_list",
//             Key: {
//               id: data.staff_id,
//             },
//             ExpressionAttributeNames: {
//               "#clocked_state": "clocked_state",
//               "#last_start_date": "last_start_date",
//               "#track_id": "track_id",
//               "#site_id": "site_id",
//             },
//             ExpressionAttributeValues: {
//               ":clocked_state": data.clocked_state,
//               ":last_start_date": data.start_date,
//               ":track_id": data.id,
//               ":updateAt": timeStamp,
//               ":site_id": data.tableName,
//             },
//             UpdateExpression:
//               "SET #last_start_date = :last_start_date, #clocked_state = :clocked_state, #track_id = :track_id, #site_id = :site_id, updateAt = :updateAt",
//             ReturnValues: "ALL_NEW",
//           };

//           await dynamoDb.update(params).promise();
//         } else {
//           const oldParams = {
//             TableName: "staff_list",
//             Key: {
//               id: data.old_staff_id,
//             },
//             ExpressionAttributeNames: {
//               "#clocked_state": "clocked_state",
//             },
//             ExpressionAttributeValues: {
//               ":clocked_state": false,
//             },
//             UpdateExpression: "SET #clocked_state = :clocked_state",
//             ReturnValues: "ALL_NEW",
//           };

//           await dynamoDb.update(oldParams).promise();
//         }
//       }
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: `${data.name} track data has been successfully updated`,
//     });
//   } catch (error) {
//     return res.status(200).json(error);
//   }
// });

// router.post("/deletetrack", async (req, res) => {
//   try {
//     const timeStamp = new Date().getTime();
//     const data = req.body;
//     if (!data) {
//       return res.status(200).json({ statusCode: 400, message: "Bad Request" });
//     }

//     const params = {
//       TableName: data.tableName,
//       Key: {
//         id: data.id,
//       },
//     };

//     await dynamoDb.delete(params).promise();

//     if (data.state) {
//       const staffParams = {
//         TableName: "staff_list",
//         Key: {
//           id: data.staff_id,
//         },
//         ExpressionAttributeNames: {
//           "#clocked_state": "clocked_state",
//         },
//         ExpressionAttributeValues: {
//           ":clocked_state": false,
//           ":updateAt": timeStamp,
//         },
//         UpdateExpression:
//           "SET #clocked_state = :clocked_state, updateAt = :updateAt",
//         ReturnValues: "ALL_NEW",
//       };

//       await dynamoDb.update(staffParams).promise();
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: "Track data has been successfully deleted",
//     });
//   } catch (error) {
//     return res.status(200).json(error);
//   }
// });

router.post("/updatetrack", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const promise = data.map(async (item, index) => {
      const updateParam = {
        TableName: item.tableName,
        Key: {
          id: item.id,
        },
        ExpressionAttributeNames: {
          "#date": "date",
          "#start_date": "start_date",
          "#end_date": "end_date",
          "#status": "status",
          "#total_time": "total_time",
        },
        ExpressionAttributeValues: {
          ":date": moment(item.start_date).format("YYYY-MM-DD"),
          ":start_date": item.start_date,
          ":end_date": item.end_date,
          ":status": item.status,
          ":total_time": item.total_time,
          ":updateAt": timeStamp,
        },
        UpdateExpression:
          "SET #date = :date, #start_date = :start_date, #end_date = :end_date, #status = :status, #total_time = :total_time, updateAt = :updateAt",
        ReturnValues: "ALL_NEW",
      };

      // Check if the item has an origin_date
      if (item.origin_date) {
        // If it does, add it to the ExpressionAttributeNames, ExpressionAttributeValues, and UpdateExpression
        updateParam.ExpressionAttributeNames["#origin_date"] = "origin_date";
        updateParam.ExpressionAttributeNames["#update_info"] = "update_info";
        updateParam.ExpressionAttributeValues[":origin_date"] =
          item.origin_date;
        updateParam.ExpressionAttributeValues[":update_info"] =
          item.update_info;
        updateParam.ExpressionAttributeValues[":track_type"] = 2;
        updateParam.UpdateExpression +=
          ", #origin_date = :origin_date, #update_info = :update_info, track_type = :track_type";
      }

      // Return the promise from the map function
      return dynamoDb.update(updateParam).promise();
    });

    // Now promise is an array of promises
    await Promise.all(promise);

    return res.status(200).json({
      statusCode: 200,
      message: `track data has been successfully updated`,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/deletetrack", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
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
    return res.status(200).json(error);
  }
});

router.post("/getimage", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // replace with your bucket name
      Key: data.key, // replace with the image key
    };

    try {
      const data = await s3bucket.getObject(params).promise();
      var base64Data = data.Body.toString("base64");
    } catch (error) {
      console.log(error);
      return res.status(200).json({ statusCode: 500, error });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Company Logo",
      data: base64Data,
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

export default router;
