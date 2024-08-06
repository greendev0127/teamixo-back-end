import AWS from "aws-sdk";
import { Router } from "express";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/copydata", async (req, res) => {
  try {
    const data = req.body;

    const fetchSiteParams = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
      },
    };

    const siteResult = await dynamoDb.scan(fetchSiteParams).promise();

    const siteData = siteResult.Items;

    const migrationPromise = siteData.map(async (site, siteIndex) => {
      const fetchOldDataParams = {
        TableName: site.table_name,
      };

      const result = await dynamoDb.scan(fetchOldDataParams).promise();

      const oldDatas = result.Items;

      const promise = oldDatas.map(async (item, index) => {
        const migrationDataParams = {
          TableName: data.newTableName,
          Item: {
            ...item,
            site_id: site.id,
          },
        };

        await dynamoDb.put(migrationDataParams).promise();
      });

      await Promise.all(promise);
    });

    await Promise.all(migrationPromise);

    return res.status(200).json({ data: siteData });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
});

export default router;
