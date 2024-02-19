import AWS from "aws-sdk";
import { Router } from "express";
const uuid = require("uuid");

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3bucket = new AWS.S3();
var ses = new AWS.SES();

const router = Router();

router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }
    const pin = Math.floor(1000 + Math.random() * 9000);
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    let Item = {
      id: uuid.v1(),
      organization_id: data.companyInfo.organization_id,
      email: data.email,
      name: data.name,
      avatar: process.env.DEFAULT_AVATAR,
      pin: pin,
      role: data.role,
      level: data.level,
      type: data.type,
      site_id: null,
      track_id: null,
      clocked_state: false,
      state: true,
      last_start_date: null,
      createAt: timeStamp,
      updateAt: timeStamp,
    };

    const params = {
      UserPoolId: process.env.USER_POOL_ID, // replace with your User Pool ID
      Username: data.email, // replace with the username
      TemporaryPassword: result, // replace with a temporary password
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
          Value: data.level == 2 ? "admin" : "member",
        },
        {
          Name: "custom:user_id",
          Value: Item.id,
        },
        {
          Name: "custom:level",
          Value: data.level.toString(),
        },
        {
          Name: "custom:organization_id",
          Value: data.companyInfo.organization_id,
        },
      ],
      MessageAction: "SUPPRESS", // suppresses the welcome message
    };
    await cognito.adminCreateUser(params).promise();

    const staffParams = {
      TableName: "staff_list",
      Item,
    };

    await dynamoDb.put(staffParams).promise();

    const inviteLink =
      data.level === 2
        ? "https://teamixo-server.vercel.app/invite/" + Item.id
        : "https://teamixo-user.vercel.app/invite/" + Item.id;

    var emailParams = {
      Destination: {
        ToAddresses: [data.email], // replace recipient@example.com with the recipient's email address
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<div>
              <p>Dear ${data.name}</p>
              <p>
                You have been invited to join the ${data.companyInfo.name} workspace, we use this
                system for you to clock-in and clock-out of your shifts as well as to manage
                your employee profile, it is important you setup your profile now using the
                link below:
              </p>
              <p>
                <a
                  href="${inviteLink}"
                  style="
                    height: 20px;
                    background-color: #3a2456;
                    color: white;
                    border-radius: 6px;
                    padding: 5px 8px 5px 8px;
                    text-decoration: none;
                    font-weight: 600;
                  "
                  >SET PASSWORD</a
                >
              </p>
              <p>
                <span style="font-weight: 600"
                  >You will need your PIN number to create your password</span
                ><span>- your unique PIN number is: </span
                ><span style="font-weight: 600">${pin}.</span>
              </p>
              <p>
                <span style="font-weight: 600"
                  >You will also use this PIN to clock in and clock out of shifts so please
                  keep it safe and on hand.</span
                >
              </p>
              <p>
                <span
                  >Once you have created your account using the link above you will be able
                  to login at</span
                ><br />
                <a href="https://app.teamixo.com/" style="text-decoration: none"
                  >https://app.teamixo.com/</a
                ><span style="font-weight: 600">
                  where you can manage your profile and update your PIN to a more memorable
                  number for yourself.</span
                >
              </p>
              <p>
                If you have any questions please reply to this e-mail, send an e-mail to
                ${data.companyInfo.email} or contact your manager.
              </p>
              <p>Kind Regards,</p>
              <p>The ${data.companyInfo.name} admin team.</p>
            </div>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `You are invited as member from ${data.companyName}`, // replace with your email subject
        },
      },
      Source: "Teamixo Support <support@teamixo.com>", // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully created",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
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

router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    let location = "";

    if (data.avatar) {
      var buf = Buffer.from(
        data.avatar.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const type = data.avatar.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Avatars/${data.organization_id}/avatar${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({ statusCode: 500, error });
      }
    }

    const params = data.avatar
      ? {
          TableName: "staff_list",
          Key: {
            id: data.id,
          },
          ExpressionAttributeNames: {
            "#name_text": "name",
            "#role_text": "role",
            "#avatar": "avatar",
            "#birth": "birth",
            "#pin": "pin",
            "#type": "type",
            "#state": "state",
          },
          ExpressionAttributeValues: {
            ":name": data.name,
            ":role": data.role,
            ":type": data.type,
            ":avatar": location,
            ":birth": data.birth,
            ":pin": data.pin,
            ":state": true,
            ":updateAt": timeStamp,
          },
          UpdateExpression:
            "SET #name_text = :name, #role_text = :role, #type = :type, #avatar = :avatar, #birth = :birth, #pin = :pin, #state = :state, updateAt = :updateAt",
          ReturnValues: "ALL_NEW",
        }
      : {
          TableName: "staff_list",
          Key: {
            id: data.id,
          },
          ExpressionAttributeNames: {
            "#name_text": "name",
            "#role_text": "role",
            "#birth": "birth",
            "#pin": "pin",
            "#type": "type",
            "#state": "state",
          },
          ExpressionAttributeValues: {
            ":name": data.name,
            ":role": data.role,
            ":type": data.type,
            ":birth": data.birth,
            ":pin": data.pin,
            ":state": true,
            ":updateAt": timeStamp,
          },
          UpdateExpression:
            "SET #name_text = :name, #role_text = :role, #type = :type, #birth = :birth, #pin = :pin, #state = :state, updateAt = :updateAt",
          ReturnValues: "ALL_NEW",
        };

    await dynamoDb.update(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully updated",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/upgrade", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const pin = Math.floor(1000 + Math.random() * 9000);
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const addParams = {
      UserPoolId: process.env.USER_POOL_ID, // replace with your User Pool ID
      Username: data.email, // replace with the username
      TemporaryPassword: result, // replace with a temporary password
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
          Value: data.id,
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
    await cognito.adminCreateUser(addParams).promise();

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#role_text": "role",
        "#type": "type",
        "#state": "state",
        "#pin": "pin",
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":type": data.type,
        ":state": true,
        ":pin": pin,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #role_text = :role, #type = :type, #state = :state, #pin = :pin, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params).promise();

    const inviteLink = "https://teamixo-user.vercel.app/invite/" + data.id;

    var emailParams = {
      Destination: {
        ToAddresses: [data.email], // replace recipient@example.com with the recipient's email address
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<div>
            <p>Dear ${data.name}</p>
            <p>
              You have been invited to join the ${data.companyInfo.name} workspace, we use this
              system for you to clock-in and clock-out of your shifts as well as to manage
              your employee profile, it is important you setup your profile now using the
              link below:
            </p>
            <p>
              <a
                href="${inviteLink}"
                style="
                  height: 20px;
                  background-color: #3a2456;
                  color: white;
                  border-radius: 6px;
                  padding: 5px 8px 5px 8px;
                  text-decoration: none;
                  font-weight: 600;
                "
                >SET PASSWORD</a
              >
            </p>
            <p>
              <span style="font-weight: 600"
                >You will need your PIN number to create your password</span
              ><span>- your unique PIN number is: </span
              ><span style="font-weight: 600">${pin}.</span>
            </p>
            <p>
              <span style="font-weight: 600"
                >You will also use this PIN to clock in and clock out of shifts so please
                keep it safe and on hand.</span
              >
            </p>
            <p>
              <span
                >Once you have created your account using the link above you will be able
                to login at</span
              ><br />
              <a href="https://app.teamixo.com/" style="text-decoration: none"
                >https://app.teamixo.com/</a
              ><span style="font-weight: 600">
                where you can manage your profile and update your PIN to a more memorable
                number for yourself.</span
              >
            </p>
            <p>
              If you have any questions please reply to this e-mail, send an e-mail to
              ${data.companyInfo.email} or contact your manager.
            </p>
            <p>Kind Regards,</p>
            <p>The ${data.companyInfo.name} admin team.</p>
          </div>
          `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "You are invited as member from Teamixo", // replace with your email subject
        },
      },
      Source: "support@teamixo.com", // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Upgrade Successful",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Reqeust" });
    }

    if (data.state) {
      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: data.email,
      };

      await cognito.adminDeleteUser(params).promise();
    }

    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
    };

    await dynamoDb.delete(params).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully deleted",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/addpermission", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const permissionParam = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#permission": "permission",
      },
      ExpressionAttributeValues: {
        ":permission": data.permission,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #permission = :permission, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(permissionParam).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Permissions has been successfully added!",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/fetchadmin", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const params = {
      TableName: "staff_list",
      FilterExpression:
        "#organization_id = :organization_id AND #level = :level",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#level": "level",
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":level": 2,
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

router.post("/grade", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#level": "level",
        "#permission": "permission",
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":level": data.level,
        ":permission": data.permission,
        ":role": data.staff_role,
        ":updateAt": timeStamp,
      },
      UpdateExpression:
        "SET #level = :level, #permission = :permission, #role = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };
    await dynamoDb.update(updateParams).promise();

    const cognitoParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: data.email,
      UserAttributes: [
        {
          Name: "custom:level",
          Value: data.level.toString(),
        },
        {
          Name: "custom:role",
          Value: data.role,
        },
      ],
    };

    await cognito.adminUpdateUserAttributes(cognitoParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff has been successfully down graded",
    });
  } catch (error) {
    res.status(200).json(error);
  }
});

router.post("/block", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id,
      },
      ExpressionAttributeNames: {
        "#block_state": "block_state",
      },
      ExpressionAttributeValues: {
        ":block_state": data.block_state,
        ":updateAt": timeStamp,
      },
      UpdateExpression: "SET #block_state = :block_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParams).promise();

    return res.status(200).json({
      statusCode: 200,
      message: "Staff block state has been successfully changed",
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});

router.post("/emailduplicate", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request" });
    }

    var params = {
      TableName: "staff_list",
      FilterExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" }, // field to check
      ExpressionAttributeValues: { ":email": data.email },
    };

    const result = await dynamoDb.scan(params).promise();

    return res.status(200).json({ statusCode: 200, data: result.Items });
  } catch (error) {
    console.log(error);
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
        track_id: uid,
        staff_id: data.staff.id,
        date: moment(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
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
        ":last_start_date": roundToNearestFiveMinutes(data.date, data.round),
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

router.post("/end", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({ statusCode: 400, message: "Bad Request!" });
    }
    //calculate the total time from start work to start break
    var differenceInMs =
      roundToNearestFiveMinutes(data.date, data.round) -
      data.staff.last_start_date;

    var total_time = differenceInMs;

    const uid = uuid.v1();
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
        ":end_date": roundToNearestFiveMinutes(data.date, data.round),
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
        date: moment(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
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

export default router;
