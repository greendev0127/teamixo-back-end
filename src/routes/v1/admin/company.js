import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const DBController = new AWS.DynamoDB();
const cognito = new AWS.CognitoIdentityServiceProvider();

const router = Router();

router.post("/delete_sites", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the delete ID" });
    }

    const scanParams = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id,
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(scanParams).promise();
      items.Items.forEach((item) => scanResults.push(item));
      scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const site of scanResults) {
      const deleteParams = {
        TableName: "site_list",
        Key: {
          id: site.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res
      .status(200)
      .json({ message: "All site data has been successfully deleted!" });
  } catch (error) {
    console.log("Error occured in delete site", error);
    return res.status(500).json({ message: "Server Error!", error: error });
  }
});

router.post("/delete_roles", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the delete ID" });
    }

    const scanParams = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id,
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(scanParams).promise();
      items.Items.forEach((item) => scanResults.push(item));
      scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const role of scanResults) {
      const deleteParams = {
        TableName: "role_list",
        Key: {
          id: role.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res
      .status(200)
      .json({ message: "All role data has been successfully deleted!" });
  } catch (error) {
    console.log("Error occured in delete site", error);
    return res.status(500).json({ message: "Server Error!", error: error });
  }
});

router.post("/delete_tracks", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the delete ID" });
    }

    const deleteTrackTableParams = {
      TableName: "record_" + data.id,
    };

    await DBController.deleteTable(deleteTrackTableParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Track record data has been successfully deleted!",
    });
  } catch (error) {
    console.log("Error occured: ", error);
    return res.status(200).json({ message: "Server Error!", error: error });
  }
});

router.post("/delete_staffs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the delete ID" });
    }

    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id, // Replace 'YourId' with the id you want to delete
      },
    };

    const scanResults = [];
    let items;

    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");

    for (const item of scanResults) {
      const userParam = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: item.email,
      };

      await cognito.adminDeleteUser(userParam).promise();

      const deleteParams = {
        TableName: "staff_list",
        Key: {
          id: item.id,
        },
      };
      await dynamoDb.delete(deleteParams).promise();
    }

    return res.status(200).json({
      statusCode: 200,
      message: "All staffs data has been successfully deleted",
    });
  } catch (error) {
    console.log("Error Occured: ", error);
    return res.status(500).json({ message: "Server Error!", error: error });
  }
});

router.post("/delete_company", async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return res
        .status(400)
        .json({ message: "Bad Request. Server can't find the delete ID" });
    }

    const deleteCompanyParams = {
      TableName: "company_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(deleteCompanyParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully deleted!",
    });
  } catch (error) {
    console.log("Error Occured: ", error);
    return res.status(500).json({ message: "Server Error!", error: error });
  }
});

export default router;
