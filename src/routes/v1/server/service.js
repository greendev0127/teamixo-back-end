import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(404).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organizationId,
      },
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body

    if(!data) {
      return res.status(400).json({message: "Bad Requrest!"})
    }

    let Item = data
    Item.id = timeStamp.toString()
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp
    Item.table_name = 'record_' + data.organization_id

    const createServiceParams = {
      TableName: "site_list",
      Item
    }

    await dynamoDb.put(createServiceParams).promise()

    return res.status(200).json({
      statusCode: 200,
      message: "Service has been successfully created."
    })
  } catch(error) {
    console.log("Error occurred: ", error)
    return res.state(500).json(error.message)
  }
})

router.post("/delete", async (req, res) => {
  try {
    const data = req.body

    if(!data) {
      return res.status(400).json({message: "Bad Request"})
    }
    
    const deleteServiceParams = {
      TableName: "site_list",
      Key: {
        id: data.id
      }
    };

    await dynamoDb.delete(deleteServiceParams).promise()

    return res.status(200).json({
      statusCode: 200,
      message: "Service data has been successfilly deleted."
    })
  } catch (error) {
    console.log("Error occurred: ", error)
    return res.status(500).json(error.message)
  }
})

router.post('/getservice', async (req, res) => {
  try {
    const data = req.body
    
    if(!data) {
      return res.status(400).json({message: "Bad Request."})
    }

    const getParams = {
      TableName: 'site_list',
      Key: {
        id: data.id
      }
    }

    const service = await dynamoDb.get(getParams).promise()

    return res.status(200).json({statusCode: 200, service: service})
  } catch(error) {
    console.log("Error occurred: ", error)
    return res.status(500).json(error)
  }
})

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;

    if (!data) {
      return res.status(400).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "site_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#description_text": "description",
        "#round": "round",
        "#radius": "radius",
        "#remote": "remote",
        "#address": "address",
        "#lat": "lat",
        "#lng": "lng",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":description": data.description,
        ":round": data.round,
        ":radius": data.radius,
        ":remote": data.remote,
        ":address": data.address,
        ":lat": data.lat,
        ":lng": data.lng,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #name_text = :name, #description_text = :description, #round = :round, #radius = :radius, #remote = :remote, #address = :address, #lat = :lat, #lng = :lng, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Service data has been successfully updated",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
