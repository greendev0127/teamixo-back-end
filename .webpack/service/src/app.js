/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/routes/admin/admin.route.js":
/*!*****************************************!*\
  !*** ./src/routes/admin/admin.route.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
var ddb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB)({
  apiVersion: "2012-08-10"
});
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const {
      password,
      email,
      name
    } = data;
    const signUpParams = {
      ClientId: process.env.ADMIN_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{
        Name: "email",
        Value: email
      }, {
        Name: "name",
        Value: name
      }]
    };
    const signUpResponse = await cognito.signUp(signUpParams).promise();
    return res.status(200).json({
      message: "User signed up successfully",
      user: signUpResponse.UserSub
    });
  } catch (err) {
    console.log("Error signing up user:", err);
    return res.status(500).json({
      message: err.message
    });
  }
});
router.post("/signin", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const {
      password,
      email
    } = data;
    const signInParams = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.ADMIN_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };
    const signInResponse = await cognito.initiateAuth(signInParams).promise();
    return res.status(200).json({
      message: "User signed in successfully",
      accessToken: signInResponse.AuthenticationResult.AccessToken,
      idToken: signInResponse.AuthenticationResult.IdToken
    });
  } catch (err) {
    console.log("Error signing up user:", err);
    return res.status(500).json({
      message: err.message
    });
  }
});
router.post("/confirmSignUp", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const {
      verificationCode,
      email
    } = data;
    const confirmSignUpParams = {
      ClientId: process.env.ADMIN_CLIENT_ID,
      Username: email,
      ConfirmationCode: verificationCode
    };
    await cognito.confirmSignUp(confirmSignUpParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Email address confirmed successfully"
    });
  } catch (err) {
    console.log("Error confirming email address:", err);
    return res.status(500).json({
      message: err.message
    });
  }
});
router.get("/getUser", async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const getUserParams = {
      AccessToken: accessToken
    };
    const user = await cognito.getUser(getUserParams).promise();
    return res.status(200).json({
      user
    });
  } catch (err) {
    console.error("Error retrieving user:", err);
    return res.status(500).json({
      message: err.message
    });
  }
});
router.get("/fetchdata", async (req, res) => {
  try {
    const fetchUserParams = {
      TableName: "staff_list"
    };
    const staffData = await dynamoDb.scan(fetchUserParams).promise();
    const fetchSiteParams = {
      TableName: "site_list"
    };
    const siteData = await dynamoDb.scan(fetchSiteParams).promise();
    const fetchCompanyParams = {
      TableName: "company_list"
    };
    const companyData = await dynamoDb.scan(fetchCompanyParams).promise();
    return res.status(200).json({
      statusCode: 200,
      data: {
        staffData: staffData,
        siteData,
        siteData,
        companyData,
        companyData
      }
    });
  } catch (err) {
    console.log("error", err);
    return res.status(404).json(error);
  }
});
router.get("/companies", async (req, res) => {
  try {
    const companyParams = {
      TableName: "company_list"
    };
    const companyData = await dynamoDb.scan(companyParams).promise();
    const orgParams = {
      TableName: "organization"
    };
    const orgData = await dynamoDb.scan(orgParams).promise();
    return res.status(200).json({
      statusCode: 200,
      data: {
        companyData: companyData,
        orgData: orgData
      }
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/deleteowner", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const orgParam = {
      TableName: "organization",
      Key: {
        id: data.orgId
      }
    };
    await dynamoDb.delete(orgParam).promise();
    const companyParam = {
      TableName: "company_list",
      Key: {
        id: data.companyId
      }
    };
    await dynamoDb.delete(companyParam).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Owner data has been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/deletesites", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId // Replace 'YourId' with the id you want to delete
      }
    };

    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const item of scanResults) {
      const params = {
        TableName: item.table_name
      };
      await ddb.deleteTable(params).promise();
      const deleteParams = {
        TableName: "site_list",
        Key: {
          id: item.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Sites data has been successfully deleted"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/deleterole", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId // Replace 'YourId' with the id you want to delete
      }
    };

    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const item of scanResults) {
      const deleteParams = {
        TableName: "role_list",
        Key: {
          id: item.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/deletestaffs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId // Replace 'YourId' with the id you want to delete
      }
    };

    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const item of scanResults) {
      const userParam = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: item.email
      };
      await cognito.adminDeleteUser(userParam).promise();
      const deleteParams = {
        TableName: "staff_list",
        Key: {
          id: item.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/deletedocs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "documents",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.orgId // Replace 'YourId' with the id you want to delete
      }
    };

    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const item of scanResults) {
      const urlParts = new URL(item.docFile).pathname.split("/");
      const key = urlParts.slice(1).join("/").replaceAll("%20", " ");
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        // replace with your bucket name
        Key: key // replace with the image key
      };

      await s3bucket.deleteObject(params).promise();
      const deleteParams = {
        TableName: "documents",
        Key: {
          id: item.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Role data has been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/admin/index.js":
/*!***********************************!*\
  !*** ./src/routes/admin/index.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _admin_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./admin.route */ "./src/routes/admin/admin.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _admin_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/client/client.route.js":
/*!*******************************************!*\
  !*** ./src/routes/client/client.route.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);



const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
function roundToNearestFiveMinutes(date, round) {
  const ms = 1000 * 60 * round; // convert 5 minutes to milliseconds
  const roundedDate = new Date(Math.round(date / ms) * ms);
  return roundedDate.getTime();
}
router.post("/getsite", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      }
    };
    const site = await dynamoDb.get(params).promise();
    const companyParams = {
      TableName: "company_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": site.Item.organization_id
      }
    };
    const company = await dynamoDb.scan(companyParams).promise();
    const response = {
      statusCode: 200,
      body: {
        site: site,
        company: company
      }
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: "organization",
      Key: {
        id: data.id
      }
    };
    const result = await dynamoDb.get(params).promise();
    if (result.Item.update_state) {
      const siteParams = {
        TableName: "organization",
        Key: {
          id: data.id
        },
        ExpressionAttributeNames: {
          "#update_state": "update_state"
        },
        ExpressionAttributeValues: {
          ":update_state": false,
          ":updateAt": timeStamp
        },
        UpdateExpression: "SET #update_state = :update_state, updateAt = :updateAt",
        ReturnValues: "ALL_NEW"
      };
      await dynamoDb.update(siteParams).promise();
    }
    const response = {
      statusCode: 200,
      body: result
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const uid = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        workPosition: data.workPosition,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.tableName,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(params).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
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
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "break",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();

    // update user with break state
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":break_state": true,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "restart",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":break_state": false,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        total_time: 0,
        name: data.staff.name,
        status: "end",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":break_state": false,
        ":record_id": null,
        ":site_id": null,
        ":last_start_date": null,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/start-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      }
    };
    const checkResult = await dynamoDb.get(checkParams).promise();
    if (checkResult.Item.clocked_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff already clocked in."
      });
    }
    const uid = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        site_id: data.siteId,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        workPosition: data.workPosition,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.siteId,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(params).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/break-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      }
    };
    const checkResult = await dynamoDb.get(checkParams).promise();
    if (!checkResult.Item.clocked_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff doesn't clock in yet."
      });
    } else if (checkResult.Item.break_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff break now!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
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
        workPosition: data.workPosition,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "break",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();

    // update user with break state
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":break_state": true,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/restart-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      }
    };
    const checkResult = await dynamoDb.get(checkParams).promise();
    if (!checkResult.Item.clocked_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff doesn't clock in yet."
      });
    } else if (!checkResult.Item.break_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff work now!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
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
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "restart",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":break_state": false,
        ":record_id": uid,
        ":last_start_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #break_state = :break_state, #record_id = :record_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/end-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const checkParams = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      }
    };
    const checkResult = await dynamoDb.get(checkParams).promise();
    if (!checkResult.Item.clocked_state) {
      return res.status(200).json({
        statusCode: 400,
        message: "This staff doesn't clock in yet."
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(timeStamp, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(timeStamp, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
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
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        workPosition: data.workPosition,
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        total_time: 0,
        name: data.staff.name,
        status: "end",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":break_state": false,
        ":record_id": null,
        ":site_id": null,
        ":last_start_date": null,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    const result = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: result
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const uid = timeStamp.toString();
    const staff_id = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: staff_id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(timeStamp, data.round),
        end_date: null,
        total_time: null,
        name: data.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
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
      updateAt: timeStamp
    };
    const params = {
      TableName: "staff_list",
      Item
    };
    await dynamoDb.put(params).promise();
    const response = {
      stsatusCode: 200,
      message: "success"
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/client/index.js":
/*!************************************!*\
  !*** ./src/routes/client/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _client_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./client.route */ "./src/routes/client/client.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _client_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/company/company.route.js":
/*!*********************************************!*\
  !*** ./src/routes/company/company.route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    console.log(data);
    const Item = {
      id: data.organizationId,
      email: data.email,
      state: "free",
      name: data.name,
      city: data.city,
      country: data.country,
      address: data.address,
      address_sec: data.address_sec,
      postcode: data.postCode,
      telephone: data.telePhone,
      organization_id: data.organizationId,
      country_state: data.state,
      timeZone: data.timeZone,
      logo: process.env.DEFAULT_COMPANY_LOGO,
      date_format: "DD-MM-YYYY",
      type: 1,
      round: 5,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const companyCreateParams = {
      TableName: "company_list",
      Item
    };
    const response = await dynamoDb.put(companyCreateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/create-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const record_table = "record_" + data.organizationId;
    const Item = {
      id: data.organizationId,
      email: data.email,
      state: "free",
      name: data.name,
      city: data.city,
      country: data.country,
      currency: data.currency,
      address: data.address,
      address_sec: data.address_sec,
      postcode: data.postCode,
      telephone: data.telePhone,
      organization_id: data.organizationId,
      country_state: data.state,
      timeZone: data.timeZone,
      logo: process.env.DEFAULT_COMPANY_LOGO,
      date_format: "DD-MM-YYYY",
      record_table: record_table,
      type: 1,
      round: 5,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const companyCreateParams = {
      TableName: "company_list",
      Item
    };
    const response = await dynamoDb.put(companyCreateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create",
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "company_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result
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
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = "";
    if (data.logo) {
      var buf = Buffer.from(data.logo.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const type = data.logo.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Logos/${data.name}/${data.name}_${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({
          statusCode: 500,
          error
        });
      }
    }
    const params = data.logo ? {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#rdname": "rdname",
        "#logo": "logo",
        "#date_format": "date_format",
        "#timeZone": "timeZone",
        "#type": "type",
        "#round": "round"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":rdname": data.rdname,
        ":logo": location,
        ":date_format": data.dateFormat,
        ":timeZone": data.timeZone,
        ":type": data.type,
        ":round": data.round,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #rdname = :rdname, #logo = :logo, #date_format = :date_format, #timeZone = :timeZone, #type = :type, #round = :round, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    } : {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#rdname": "rdname",
        "#date_format": "date_format",
        "#timeZone": "timeZone",
        "#type": "type",
        "#round": "round"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":rdname": data.rdname,
        ":date_format": data.dateFormat,
        ":timeZone": data.timeZone,
        ":type": data.type,
        ":round": data.round,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #rdname = :rdname, #date_format = :date_format, #timeZone = :timeZone, #type = :type, #round = :round, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully updated",
      data: location,
      response: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/update-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = data.logo;
    if (data.base64) {
      var buf = Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const type = data.base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Logos/${data.name}/${data.name}_${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          statusCode: 500,
          error
        });
      }
    }
    const params = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#type": "type",
        "#logo": "logo",
        "#timeZone": "timeZone",
        "#date_format": "date_format",
        "#round": "round",
        "#email": "email",
        "#telephone": "telephone"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":type": data.type,
        ":logo": location,
        ":timeZone": data.timeZone,
        ":date_format": data.date_format,
        ":round": data.round,
        ":email": data.email,
        ":telephone": data.telephone,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #type = :type, #logo = :logo, #timeZone = :timeZone, #date_format = :date_format, #round = :round, #email = :email, #telephone = :telephone, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/state", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const organizationParams = {
      TableName: "organization",
      Key: {
        id: data.organization_id
      },
      ExpressionAttributeNames: {
        "#update_state": "update_state"
      },
      ExpressionAttributeValues: {
        ":update_state": true,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #update_state = :update_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(organizationParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/getcompany", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const companyParams = {
      TableName: "company_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const company = await dynamoDb.scan(companyParams).promise();
    const response = {
      statusCode: 200,
      body: company
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updatelogo", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = "";
    var buf = Buffer.from(data.logo.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const type = data.logo.split(";")[0].split("/")[1];
    const imageParam = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Logos/${data.organization_id}/${timeStamp}.${type}`,
      Body: buf,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`
    };
    try {
      const uploadData = await s3bucket.upload(imageParam).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        statusCode: 500,
        error
      });
    }
    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#logo": "logo"
      },
      ExpressionAttributeValues: {
        ":logo": location,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #logo = :logo, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company Logo has been successfully updated",
      location: location,
      response: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updatename", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name = :name, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updatesettings", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#rdname": "rdname",
        "#break": "break",
        "#timeZone": "timeZone",
        "#date_format": "date_format",
        "#type": "type",
        "#round": "round"
      },
      ExpressionAttributeValues: {
        ":rdname": data.rdname,
        ":break": data.break,
        ":timeZone": data.timeZone,
        ":date_format": data.date_format,
        ":type": data.type,
        ":round": data.round,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #rdname = :rdname, #break = :break, #timeZone = :timeZone, #date_format = :date_format, #type = :type, #round = :round, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updatecontact", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#email": "email",
        "#telephone": "telephone"
      },
      ExpressionAttributeValues: {
        ":email": data.email,
        ":telephone": data.telephone,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #email = :email, #telephone = :telephone, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company Name has been successfully updated",
      response: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updateForm", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#form": "form"
      },
      ExpressionAttributeValues: {
        ":form": data.form,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #form = :form, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company Form has been successfully updated",
      response: result
    });
  } catch (error) {
    return res.status(400).json(error);
  }
});
router.post("/checkPaidState", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const checkParam = {
      TableName: "company_list",
      Key: {
        id: data.org_id
      }
    };
    const response = await dynamoDb.get(checkParam).promise();
    return res.status(200).json({
      statusCode: 200,
      data: response
    });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json({
      statusCode: 400,
      error: error
    });
  }
});
router.post("/checkStaffsNumber", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    console.log(data);
    const tableName = "staff_list"; // Replace with your table name

    const params = {
      TableName: tableName,
      FilterExpression: "organization_id = :organization_id",
      ExpressionAttributeValues: {
        ":organization_id": data.orgId
      }
    };
    const items = await dynamoDb.scan(params).promise();
    const checkParam = {
      TableName: "company_list",
      Key: {
        id: data.orgId
      }
    };
    const response = await dynamoDb.get(checkParam).promise();
    console.log(response);
    const result = {
      totalNumber: items.Items.length,
      limitNumber: response.Item.paymentInfo.quantity
    };
    return res.status(200).json({
      statusCode: 200,
      data: result
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 400,
      error: error
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/company/index.js":
/*!*************************************!*\
  !*** ./src/routes/company/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _company_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./company.route */ "./src/routes/company/company.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _company_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/contact/contact.route.js":
/*!*********************************************!*\
  !*** ./src/routes/contact/contact.route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
var ses = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().SES)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/addticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const TableName = "support";
    let Item = data;
    Item.id = timeStamp.toString();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    const params = {
      TableName: TableName,
      Item
    };
    const response = await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create",
      data: response
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/getticket", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "support",
      Key: {
        id: data.id
      }
    };
    const res = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: res
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/solveticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "support",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#solved": "solved"
      },
      ExpressionAttributeValues: {
        ":solved": true,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #solved = :solved, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    const message = "#" + data.id + " ticket is closed";
    return res.status(200).json({
      statusCode: 200,
      message: message
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updateticket", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "support",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#messages": "messages"
      },
      ExpressionAttributeValues: {
        ":messages": data.messages,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #messages = :messages, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    const message = "#" + data.id + " ticket is closed.";
    return res.status(200).json({
      statusCode: 200,
      message: message
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.get("/fetchtickets", async (req, res) => {
  try {
    const params = {
      TableName: "support"
    };
    const ticketData = await dynamoDb.scan(params).promise();
    return res.status(200).json({
      statusCode: 200,
      data: ticketData
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetchticket", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "support",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/sendemail", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    var emailParams = {
      Destination: {
        ToAddresses: ["support@teamixo.com"] // replace recipient@example.com with the recipient's email address
      },

      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<div>
              <p>Name: ${data.name}</p>
              <p>Email Address: ${data.email}</p>
              <p>Content: ${data.content}</p>
            </div>
            `
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Support request` // replace with your email subject
        }
      },

      Source: "Teamixo Support <contact@teamixo.com>" // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Contact email is sent to support team"
    });
  } catch (error) {
    return res.status(200).json({
      statusCode: 500,
      error: error
    });
  }
});
router.post("/join-to-list", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const Item = data;
    Item.id = timeStamp.toString();
    Item.createdAt = timeStamp;
    Item.updatedAt = timeStamp;
    const createParams = {
      TableName: "waitList",
      Item
    };
    await dynamoDb.put(createParams).promise();
    return res.status(200).json({
      message: "Join request has been successfully added"
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
router.get("/get-join-list", async (req, res) => {
  try {
    const fetchParmas = {
      TableName: "waitList"
    };
    const joinListData = await dynamoDb.scan(fetchParmas).promise();
    return res.status(200).json({
      data: joinListData
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/contact/index.js":
/*!*************************************!*\
  !*** ./src/routes/contact/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contact_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contact.route */ "./src/routes/contact/contact.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _contact_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/custom/custom.route.js":
/*!*******************************************!*\
  !*** ./src/routes/custom/custom.route.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const fs = __webpack_require__(/*! fs */ "fs");
const multer = __webpack_require__(/*! multer */ "multer");
const upload = multer({
  storage: multer.memoryStorage()
});
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const S3 = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/adddata", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      form_name: data.form_name,
      form_id: data.form_id,
      allocate_id: data.allocate_id,
      sender: data.sender,
      sender_type: data.sender_type,
      form_result: data.form_result,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const params = {
      TableName: "custom_data",
      Item
    };
    const result = await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: `${form_name} form have been created successfully!`,
      data: result
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetchdata", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "custom_data",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/custom/index.js":
/*!************************************!*\
  !*** ./src/routes/custom/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _custom_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./custom.route */ "./src/routes/custom/custom.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _custom_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/db/db.route.js":
/*!***********************************!*\
  !*** ./src/routes/db/db.route.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


var ddb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB)({
  apiVersion: "2012-08-10"
});
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/createtable", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: data.tableName,
      KeySchema: [{
        AttributeName: "id",
        KeyType: "HASH"
      }],
      AttributeDefinitions: [{
        AttributeName: "id",
        AttributeType: "S"
      }],
      BillingMode: "PAY_PER_REQUEST"
    };
    await ddb.createTable(params).promise();
    res.status(200).json({
      message: "Create table successful"
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});
router.post("/deletetable", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: data.tableName
    };
    await ddb.deleteTable(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Delete table successful"
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/db/index.js":
/*!********************************!*\
  !*** ./src/routes/db/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _db_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./db.route */ "./src/routes/db/db.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _db_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/document/document.route.js":
/*!***********************************************!*\
  !*** ./src/routes/document/document.route.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);



const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/upload", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const file = data.file;
    const base64Data = file.replace(/^data:application\/pdf;base64,/, "");
    const decodedFile = Buffer.from(base64Data, "base64");
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Document/${data.organizationId}/${moment__WEBPACK_IMPORTED_MODULE_2___default()(timeStamp).format("YYYY-MM-DD")}/${data.docName}_${timeStamp}.pdf`,
      Body: decodedFile,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `application/pdf`
    };
    let location = "";
    try {
      const uploadData = await s3bucket.upload(params).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        statusCode: 500,
        error
      });
    }
    return res.status(200).json({
      statusCode: 200,
      data: location
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/add", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let Item = data;
    Item.id = timeStamp.toString();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    const params = {
      TableName: "documents",
      Item
    };
    await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Document has been successfully created"
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "documents",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#docName": "docName",
        "#docType": "docType",
        "#docDate": "docDate",
        "#expireDate": "expireDate",
        "#assignType": "assignType",
        "#assignValue": "assignValue"
      },
      ExpressionAttributeValues: {
        ":docName": data.docName,
        ":docType": data.docType,
        ":docDate": data.docDate,
        ":expireDate": data.expireDate,
        ":assignType": data.assignType,
        ":assignValue": data.assignValue,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #docName = :docName, #docType = :docType, #docDate = :docDate, #expireDate = :expireDate, #assignType = :assignType, #assignValue = :assignValue, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully updated"
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      // replace with your bucket name
      Key: data.key // replace with the image key
    };

    await s3bucket.deleteObject(params).promise();
    const documentParams = {
      TableName: "documents",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(documentParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "delete successful"
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "documents",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
    };
    return res.status(200).json(response);
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/staff", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "documents",
      FilterExpression: "#organization_id = :organization_id AND #assignType < :assignType",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#assignType": "assignType"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":assignType": 5
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const resultDocList = result.Items.filter(item => {
      return item.assignType === 1 || item.assignType === 2 && item.assignValue === data.type || item.assignType === 3 && data.role.includes(item.assignValue) || data.userId === item.assignValue;
    });
    return res.status(200).json({
      statusCode: 200,
      body: resultDocList
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
router.post("/site", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "documents",
      FilterExpression: "#organization_id = :organization_id AND #assignType > :assignType",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#assignType": "assignType"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":assignType": 4
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const resultDocList = result.Items.filter(item => {
      return item.assignType === 5 || data.sietId === item.assignValue;
    });
    return res.status(200).json({
      statusCode: 200,
      body: resultDocList
    });
  } catch (error) {
    res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/document/index.js":
/*!**************************************!*\
  !*** ./src/routes/document/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _document_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./document.route */ "./src/routes/document/document.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _document_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/form/form.route.js":
/*!***************************************!*\
  !*** ./src/routes/form/form.route.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const fs = __webpack_require__(/*! fs */ "fs");
const multer = __webpack_require__(/*! multer */ "multer");
const upload = multer({
  storage: multer.memoryStorage()
});
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const S3 = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/newform", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      form_name: data.form_name,
      submit_label: data.submit_label,
      form_elements: data.form_elements,
      color: data.color,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const params = {
      TableName: "form_list",
      Item
    };
    await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: `${form_name} form have been created successfully!`
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updateform", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const updateParam = {
      TableName: "form_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#form_name": "form_name",
        "#submit_label": "submit_label",
        "#form_elements": "form_elements",
        "#color": "color"
      },
      ExpressionAttributeValues: {
        ":form_name": data.form_name,
        ":submit_label": data.submit_label,
        ":form_elements": data.form_elements,
        ":color": data.color,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #form_name = :form_name, #submit_label = :submit_label, #form_elements = :form_elements, #color = :color, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParam).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Allocate Form Success"
    });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "form_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const delete_param = {
      TableName: "form_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(delete_param).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Form has been removed successfully"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/allocate", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const allocateParam = {
      TableName: "form_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#allocated_site": "allocated_site",
        "#allocated_staff": "allocated_staff"
      },
      ExpressionAttributeValues: {
        ":allocated_site": data.allocated_site,
        ":allocated_staff": data.allocated_staff,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #allocated_site = :allocated_site, #allocated_staff = :allocated_staff, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(allocateParam).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Allocate Form Success"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.get("/test", async (req, res) => {
  try {
    const params = {
      TableName: "form_list"
    };
    const data = await dynamoDb.scan(params).promise();
    return res.status(200).json({
      data: data
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  const base64Data = req.body.base.split("base64,")[1];
  const decodedFile = Buffer.from(base64Data, "base64");
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "Home/Form/File/" + req.file.originalname,
    // Use the original file name
    Body: decodedFile,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: file.mimetype
  };
  try {
    const data = await S3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return res.status(200).json({
      data: data.Location,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(200).json({
      statusCode: 500,
      message: "Error uploading file"
    });
  }
});
router.post("/uploadphoto", async (req, res) => {
  const timeStamp = new Date().getTime();
  const photo = req.body.photo.split("base64,")[1];
  const decodedFile = Buffer.from(photo, "base64");
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "Home/Form/Photo/" + timeStamp,
    // Use the original file name
    Body: decodedFile,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: "image/jpeg"
  };
  try {
    const data = await S3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return res.status(200).json({
      data: data.Location,
      message: "File uploaded successfully"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(200).json({
      statusCode: 500,
      message: "Error uploading file"
    });
  }
});
router.post("/getuserform", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "contains(allocated_staff, :allocate_id)",
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id
      }
    };
    const result = await dynamoDb.scan(fetchParam).promise();
    const response = {
      statusCode: 200,
      body: result
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/getsiteform", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "contains(allocated_site, :allocate_id)",
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id
      }
    };
    const result = await dynamoDb.scan(fetchParam).promise();
    const response = {
      statusCode: 200,
      body: result
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/getforms", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const fetchParam = {
      TableName: "form_list",
      FilterExpression: "#allocate_id = :allocate_id",
      ExpressionAttributeNames: {
        "#allocate_id": "allocate_id"
      },
      ExpressionAttributeValues: {
        ":allocate_id": data.allocate_id
      }
    };
    const result = await dynamoDb.scan(fetchParam).promise();
    const response = {
      statusCode: 200,
      body: result
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/form/index.js":
/*!**********************************!*\
  !*** ./src/routes/form/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _form_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./form.route */ "./src/routes/form/form.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _form_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/index.js":
/*!*****************************!*\
  !*** ./src/routes/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _v1__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./v1 */ "./src/routes/v1/index.js");
/* harmony import */ var _db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db */ "./src/routes/db/index.js");
/* harmony import */ var _user__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user */ "./src/routes/user/index.js");
/* harmony import */ var _staff__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./staff */ "./src/routes/staff/index.js");
/* harmony import */ var _site__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./site */ "./src/routes/site/index.js");
/* harmony import */ var _setting__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./setting */ "./src/routes/setting/index.js");
/* harmony import */ var _role__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./role */ "./src/routes/role/index.js");
/* harmony import */ var _report__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./report */ "./src/routes/report/index.js");
/* harmony import */ var _remote__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./remote */ "./src/routes/remote/index.js");
/* harmony import */ var _profile__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./profile */ "./src/routes/profile/index.js");
/* harmony import */ var _document__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./document */ "./src/routes/document/index.js");
/* harmony import */ var _contact__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./contact */ "./src/routes/contact/index.js");
/* harmony import */ var _company__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./company */ "./src/routes/company/index.js");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./client */ "./src/routes/client/index.js");
/* harmony import */ var _admin__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./admin */ "./src/routes/admin/index.js");
/* harmony import */ var _logs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./logs */ "./src/routes/logs/index.js");
/* harmony import */ var _form__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./form */ "./src/routes/form/index.js");
/* harmony import */ var _custom__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./custom */ "./src/routes/custom/index.js");
/* harmony import */ var _payment__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./payment */ "./src/routes/payment/index.js");
/* harmony import */ var _migration__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./migration */ "./src/routes/migration/index.js");





















const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/v1", _v1__WEBPACK_IMPORTED_MODULE_1__["default"]);
router.use("/db", _db__WEBPACK_IMPORTED_MODULE_2__["default"]);
router.use("/user", _user__WEBPACK_IMPORTED_MODULE_3__["default"]);
router.use("/staff", _staff__WEBPACK_IMPORTED_MODULE_4__["default"]);
router.use("/site", _site__WEBPACK_IMPORTED_MODULE_5__["default"]);
router.use("/setting", _setting__WEBPACK_IMPORTED_MODULE_6__["default"]);
router.use("/role", _role__WEBPACK_IMPORTED_MODULE_7__["default"]);
router.use("/report", _report__WEBPACK_IMPORTED_MODULE_8__["default"]);
router.use("/remote", _remote__WEBPACK_IMPORTED_MODULE_9__["default"]);
router.use("/profile", _profile__WEBPACK_IMPORTED_MODULE_10__["default"]);
router.use("/document", _document__WEBPACK_IMPORTED_MODULE_11__["default"]);
router.use("/support", _contact__WEBPACK_IMPORTED_MODULE_12__["default"]);
router.use("/company", _company__WEBPACK_IMPORTED_MODULE_13__["default"]);
router.use("/client", _client__WEBPACK_IMPORTED_MODULE_14__["default"]);
router.use("/admin", _admin__WEBPACK_IMPORTED_MODULE_15__["default"]);
router.use("/logs", _logs__WEBPACK_IMPORTED_MODULE_16__["default"]);
router.use("/form", _form__WEBPACK_IMPORTED_MODULE_17__["default"]);
router.use("/custom", _custom__WEBPACK_IMPORTED_MODULE_18__["default"]);
router.use("/payment", _payment__WEBPACK_IMPORTED_MODULE_19__["default"]);
router.use("/migration", _migration__WEBPACK_IMPORTED_MODULE_20__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/logs/index.js":
/*!**********************************!*\
  !*** ./src/routes/logs/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _log_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./log.route */ "./src/routes/logs/log.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _log_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/logs/log.route.js":
/*!**************************************!*\
  !*** ./src/routes/logs/log.route.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/addlog", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const userParam = {
      TableName: "staff_list",
      Key: {
        id: data.userId
      }
    };
    const user = await dynamoDb.get(userParam).promise();
    const TableName = "logs";
    let Item = data;
    Item.id = timeStamp.toString();
    Item.user = user.Item.name;
    Item.date = timeStamp;
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    delete Item.userId;
    const params = {
      TableName: TableName,
      Item
    };
    const response = await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create",
      data: response
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetchlogs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "logs",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/migration/index.js":
/*!***************************************!*\
  !*** ./src/routes/migration/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _migration_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./migration.route */ "./src/routes/migration/migration.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _migration_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/migration/migration.route.js":
/*!*************************************************!*\
  !*** ./src/routes/migration/migration.route.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/copydata", async (req, res) => {
  try {
    const data = req.body;
    const fetchSiteParams = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const siteResult = await dynamoDb.scan(fetchSiteParams).promise();
    const siteData = siteResult.Items;
    const migrationPromise = siteData.map(async (site, siteIndex) => {
      const fetchOldDataParams = {
        TableName: site.table_name
      };
      const result = await dynamoDb.scan(fetchOldDataParams).promise();
      const oldDatas = result.Items;
      const promise = oldDatas.map(async (item, index) => {
        const migrationDataParams = {
          TableName: data.newTableName,
          Item: {
            ...item,
            site_id: site.id
          }
        };
        await dynamoDb.put(migrationDataParams).promise();
      });
      await Promise.all(promise);
    });
    await Promise.all(migrationPromise);
    return res.status(200).json({
      data: siteData
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: err
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/payment/index.js":
/*!*************************************!*\
  !*** ./src/routes/payment/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _payment_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./payment.route */ "./src/routes/payment/payment.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _payment_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/payment/payment.route.js":
/*!*********************************************!*\
  !*** ./src/routes/payment/payment.route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const stripe = __webpack_require__(/*! stripe */ "stripe")(process.env.STRIPE_S_ID);
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/subscription", async (req, res) => {
  const {
    email,
    paymentMethodId,
    number
  } = req.body;
  const data = req.body;
  console.log(email, paymentMethodId, number);
  try {
    const timeStamp = new Date().getTime();
    // Create a new customer
    const customer = await stripe.customers.create({
      email: email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Create the subscription with 20x quantity
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        plan: process.env.STRIPE_PRICE_ID,
        quantity: number // Charge for 20 units of the subscription
      }],

      expand: ["latest_invoice.payment_intent"]
    });
    console.log(subscription.id, subscription.customer, subscription.quantity);
    const paymentInfo = {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      quantity: subscription.quantity
    };
    const updatePlanParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#paymentInfo": "paymentInfo",
        "#state": "state"
      },
      ExpressionAttributeValues: {
        ":paymentInfo": paymentInfo,
        ":state": "paid",
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #paymentInfo = :paymentInfo, #state = :state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updatePlanParams).promise();
    return res.status(200).json({
      statusCode: 200,
      body: subscription
    });
  } catch (error) {
    console.log("err", error);
    return res.status(200).json({
      statusCode: 400,
      body: {
        error: error
      }
    });
  }
});
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
      const subscriptionCreated = event.data.object;
      // Handle the subscription created event
      console.log(`Subscription ${subscriptionCreated.id} created for customer ${subscriptionCreated.customer}`);
      break;
    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object;
      // Handle the subscription updated event
      console.log(`Subscription ${subscriptionUpdated.id} updated.`);
      break;
    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object;
      // Handle the subscription deleted event
      console.log(`Subscription ${subscriptionDeleted.id} deleted.`);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({
    received: true
  });
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/profile/index.js":
/*!*************************************!*\
  !*** ./src/routes/profile/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _profile_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./profile.route */ "./src/routes/profile/profile.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _profile_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/profile/profile.route.js":
/*!*********************************************!*\
  !*** ./src/routes/profile/profile.route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    const user = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: {
        user: user
      }
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#gender": "gender",
        "#birth": "birth"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":gender": data.gender,
        ":birth": data.birth,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #gender = :gender, #birth = :birth, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Profile data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/update-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = data.avatar;
    let email = data.old_email;
    if (data.base64) {
      var buf = Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const type = data.base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Avatars/${data.organization_id}/avatar${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({
          statusCode: 500,
          error
        });
      }
    }
    if (data.email) {
      email = data.email;
      const {
        USER_POOL_ID
      } = process.env;
      const params = {
        UserPoolId: USER_POOL_ID,
        Username: data.old_email,
        UserAttributes: [{
          Name: "email",
          Value: data.email
        }, {
          Name: "email_verified",
          Value: "false"
        }]
      };
      await cognito.adminUpdateUserAttributes(params).promise();
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#avatar": "avatar",
        "#email": "email",
        "#birth": "birth"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":avatar": location,
        ":email": email,
        ":birth": data.birth,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #avatar = :avatar, #email = :email, #birth = :birth, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/updateavatar", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = "";
    var buf = Buffer.from(data.avatar.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const type = data.avatar.split(";")[0].split("/")[1];
    const s3params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `Home/Avatars/${data.organization_id}/avatar${timeStamp}.${type}`,
      Body: buf,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`
    };
    try {
      const uploadData = await s3bucket.upload(s3params).promise();
      location = uploadData.Location;
    } catch (error) {
      console.log(error);
      return utils.responseData(200, {
        statusCode: 500,
        error
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#avatar": "avatar"
      },
      ExpressionAttributeValues: {
        ":avatar": location,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #avatar = :avatar, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      avatar: location,
      message: "Profile Avatar has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/changepin", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const staffParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#pin": "pin"
      },
      ExpressionAttributeValues: {
        ":pin": data.pin,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #pin = :pin, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(staffParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Pin has been successfully updated",
      response
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/gethistory", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const staffParams = {
      TableName: data.tableName,
      FilterExpression: "#staff_id = :staff_id",
      ExpressionAttributeNames: {
        "#staff_id": "staff_id"
      },
      ExpressionAttributeValues: {
        ":staff_id": data.userId
      }
    };
    const staffHistoryList = await dynamoDb.scan(staffParams).promise();
    return res.status(200).json({
      statusCode: 200,
      data: staffHistoryList
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/remote/index.js":
/*!************************************!*\
  !*** ./src/routes/remote/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _remote_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./remote.route */ "./src/routes/remote/remote.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _remote_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/remote/remote.route.js":
/*!*******************************************!*\
  !*** ./src/routes/remote/remote.route.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/sites", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/report/index.js":
/*!************************************!*\
  !*** ./src/routes/report/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _report_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./report.route */ "./src/routes/report/report.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _report_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/report/report.route.js":
/*!*******************************************!*\
  !*** ./src/routes/report/report.route.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);



const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
async function queryAndDeleteDynamoDB(params) {
  const data = await dynamoDb.scan(params).promise();
  for (let item of data.Items) {
    const deleteParams = {
      TableName: params.TableName,
      Key: {
        id: item.id
      }
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: data.tableName
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: data.tableName,
      FilterExpression: "#date between :start_date and :end_date",
      ExpressionAttributeNames: {
        "#date": "date"
      },
      ExpressionAttributeValues: {
        ":start_date": data.start_date,
        ":end_date": data.end_date
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const track_id = timeStamp;
    const promise = data.dateList.map(async (item, index) => {
      const uid = timeStamp + index + 1;
      const dateParams = {
        TableName: data.tableName,
        Item: {
          id: uid.toString(),
          track_id: track_id,
          staff_id: data.staff.id,
          date: moment__WEBPACK_IMPORTED_MODULE_2___default()(item.start_date).format("YYYY-MM-DD"),
          start_date: item.start_date,
          end_date: item.end_date,
          total_time: item.total_time,
          name: data.staff.name,
          status: item.status,
          track_type: 1,
          createdAt: timeStamp,
          updateAt: timeStamp
        }
      };
      await dynamoDb.put(dateParams).promise();
    });
    await Promise.all(promise);
    return res.status(200).json({
      statusCode: 200,
      message: `${data.staff.name} track data has been successfully created`
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/addtrack-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const track_id = timeStamp;
    const promise = data.dateList.map(async (item, index) => {
      const uid = timeStamp + index + 1;
      const dateParams = {
        TableName: data.tableName,
        Item: {
          id: uid.toString(),
          track_id: track_id,
          staff_id: data.staff.id,
          site_id: data.site.id,
          date: moment__WEBPACK_IMPORTED_MODULE_2___default()(item.start_date).format("YYYY-MM-DD"),
          start_date: item.start_date,
          end_date: item.end_date,
          total_time: item.total_time,
          name: data.staff.name,
          status: item.status,
          track_type: 1,
          createdAt: timeStamp,
          updateAt: timeStamp
        }
      };
      await dynamoDb.put(dateParams).promise();
    });
    await Promise.all(promise);
    return res.status(200).json({
      statusCode: 200,
      message: `${data.staff.name} track data has been successfully created`
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const promise = data.map(async (item, index) => {
      const updateParam = {
        TableName: item.tableName,
        Key: {
          id: item.id
        },
        ExpressionAttributeNames: {
          "#date": "date",
          "#start_date": "start_date",
          "#end_date": "end_date",
          "#status": "status",
          "#total_time": "total_time"
        },
        ExpressionAttributeValues: {
          ":date": moment__WEBPACK_IMPORTED_MODULE_2___default()(item.start_date).format("YYYY-MM-DD"),
          ":start_date": item.start_date,
          ":end_date": item.end_date ? item.end_date : null,
          ":status": item.status,
          ":total_time": item.total_time,
          ":updateAt": timeStamp
        },
        UpdateExpression: "SET #date = :date, #start_date = :start_date, #end_date = :end_date, #status = :status, #total_time = :total_time, updateAt = :updateAt",
        ReturnValues: "ALL_NEW"
      };

      // Check if the item has an origin_date
      if (item.origin_date) {
        // If it does, add it to the ExpressionAttributeNames, ExpressionAttributeValues, and UpdateExpression
        updateParam.ExpressionAttributeNames["#origin_date"] = "origin_date";
        updateParam.ExpressionAttributeNames["#update_info"] = "update_info";
        updateParam.ExpressionAttributeValues[":origin_date"] = item.origin_date;
        updateParam.ExpressionAttributeValues[":update_info"] = item.update_info;
        updateParam.ExpressionAttributeValues[":track_type"] = 2;
        updateParam.UpdateExpression += ", #origin_date = :origin_date, #update_info = :update_info, track_type = :track_type";
      }

      // Return the promise from the map function
      return dynamoDb.update(updateParam).promise();
    });

    // Now promise is an array of promises
    await Promise.all(promise);
    return res.status(200).json({
      statusCode: 200,
      message: `Edit successful`
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/deletetrack", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: data.tableName,
      FilterExpression: "#track_id = :track_id",
      ExpressionAttributeNames: {
        "#track_id": "track_id"
      },
      ExpressionAttributeValues: {
        ":track_id": data.track_id // Replace 'YourId' with the id you want to delete
      }
    };

    await queryAndDeleteDynamoDB(params);
    return res.status(200).json({
      statusCode: 200,
      message: "The report data has been deleted."
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/getimage", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      // replace with your bucket name
      Key: data.key // replace with the image key
    };

    try {
      const data = await s3bucket.getObject(params).promise();
      var base64Data = data.Body.toString("base64");
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        statusCode: 500,
        error
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Company Logo",
      data: base64Data
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/autoclockin", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const uid = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(data.dateList[0].start_date).format("YYYY-MM-DD"),
        start_date: data.dateList[0].start_date,
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.tableName,
        ":last_start_date": data.dateList[0].start_date,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(params).promise();
    const response = {
      stsatusCode: 200,
      body: result.Attributes
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/role/index.js":
/*!**********************************!*\
  !*** ./src/routes/role/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _role_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./role.route */ "./src/routes/role/role.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _role_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/role/role.route.js":
/*!***************************************!*\
  !*** ./src/routes/role/role.route.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      role: data.roleName,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const params = {
      TableName: "role_list",
      Item
    };
    await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully created"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "role_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#role_text": "role"
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "role_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Role has been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/staffrole", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#role_text": "role"
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Update Successful"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/setting/index.js":
/*!*************************************!*\
  !*** ./src/routes/setting/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _setting_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setting.route */ "./src/routes/setting/setting.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _setting_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/setting/setting.route.js":
/*!*********************************************!*\
  !*** ./src/routes/setting/setting.route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/report", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: "company_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#site_report": "site_report",
        "#staff_report": "staff_report",
        "#show_day": "show_day"
      },
      ExpressionAttributeValues: {
        ":site_report": data.site_report,
        ":staff_report": data.staff_report,
        ":show_day": data.showDay,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #site_report = :site_report, #staff_report = :staff_report, #show_day = :show_day, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Report option data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/site/index.js":
/*!**********************************!*\
  !*** ./src/routes/site/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _site_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./site.route */ "./src/routes/site/site.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _site_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/site/site.route.js":
/*!***************************************!*\
  !*** ./src/routes/site/site.route.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let Item = data;
    Item.id = timeStamp.toString();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    const params = {
      TableName: "site_list",
      Item
    };
    await dynamoDb.put(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully created"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#description_text": "description",
        "#round": "round",
        "#radius": "radius",
        "#remote": "remote"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":description": data.description,
        ":round": data.round,
        ":radius": data.radius,
        ":remote": data.remote,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #description_text = :description, #round = :round, #radius = :radius, #remote = :remote, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/update-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#description_text": "description",
        "#round": "round",
        "#radius": "radius",
        "#remote": "remote",
        "#address": "address",
        "#lat": "lat",
        "#lng": "lng"
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
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #description_text = :description, #round = :round, #radius = :radius, #remote = :remote, #address = :address, #lat = :lat, #lng = :lng, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/location", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#lat": "lat",
        "#lng": "lng",
        "#address": "address"
      },
      ExpressionAttributeValues: {
        ":lat": data.lat,
        ":lng": data.lng,
        ":address": data.address,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #lat = :lat, #lng = :lng, #address = :address, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Location data has been successfully updated"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site data had been successfully deleted"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/settime", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "site_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#siteClockInTime": "siteClockInTime"
      },
      ExpressionAttributeValues: {
        ":siteClockInTime": data.siteClockInTime,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #siteClockInTime = :siteClockInTime, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Site clock in time is setted."
    });
  } catch (error) {
    return res.status(200).json({
      statusCode: 500,
      error: error
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/staff/index.js":
/*!***********************************!*\
  !*** ./src/routes/staff/index.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _staff_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./staff.route */ "./src/routes/staff/staff.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _staff_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/staff/staff.route.js":
/*!*****************************************!*\
  !*** ./src/routes/staff/staff.route.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);



const uuid = __webpack_require__(/*! uuid */ "uuid");
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
var ses = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().SES)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
function roundToNearestFiveMinutes(date, round) {
  const ms = 1000 * 60 * round; // convert 5 minutes to milliseconds
  const roundedDate = new Date(Math.round(date / ms) * ms);
  return roundedDate.getTime();
}
router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }

    // const companyStateCheckParam = {
    //   TableName: "company_list",
    //   Key: {
    //     id: data.companyInfo.organization_id,
    //   },
    // };

    // const companyData = await dynamoDb.get(companyStateCheckParam).promise();
    // console.log(companyData);
    // if (companyData.Item.state === "free" && data.staffAmount === 3) {
    //   return res.status(200).json({
    //     statusCode: 400,
    //     type: "free",
    //     message: "You have to upgrade your plan to add staffs further.",
    //   });
    // }

    const pin = Math.floor(1000 + Math.random() * 9000);
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let avatar = process.env.DEFAULT_AVATAR;
    if (data.avatar) {
      var buf = Buffer.from(data.avatar.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const type = data.avatar.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Avatars/${data.companyInfo.organization_id}/avatar${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        avatar = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({
          statusCode: 500,
          error
        });
      }
    }
    let Item = {
      id: timeStamp.toString(),
      organization_id: data.companyInfo.organization_id,
      email: data.email,
      name: data.name,
      avatar: avatar,
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
      updateAt: timeStamp
    };
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      // replace with your User Pool ID
      Username: data.email,
      // replace with the username
      TemporaryPassword: result,
      // replace with a temporary password
      UserAttributes: [{
        Name: "email",
        Value: data.email // replace with the user's email
      }, {
        Name: "email_verified",
        Value: "true"
      }, {
        Name: "custom:role",
        Value: data.level == 2 ? "admin" : "member"
      }, {
        Name: "custom:user_id",
        Value: Item.id
      }, {
        Name: "custom:level",
        Value: data.level.toString()
      }, {
        Name: "custom:organization_id",
        Value: data.companyInfo.organization_id
      }],
      MessageAction: "SUPPRESS" // suppresses the welcome message
    };

    await cognito.adminCreateUser(params).promise();
    const staffParams = {
      TableName: "staff_list",
      Item
    };
    await dynamoDb.put(staffParams).promise();
    const inviteLink = data.level === 2 ? "https://app.teamixo.com/invite/" + Item.id : "https://user.teamixo.com/invite/" + Item.id;
    var emailParams = {
      Destination: {
        ToAddresses: [data.email] // replace recipient@example.com with the recipient's email address
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
                  >https://user.teamixo.com</a
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
            `
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: `You are invited as member from ${data.companyInfo.name}` // replace with your email subject
        }
      },

      Source: "Teamixo Support <support@teamixo.com>" // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully created"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetch", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    let location = data.avatar;
    let email = data.old_email;
    if (data.base64) {
      var buf = Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const type = data.base64.split(";")[0].split("/")[1];
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `Home/Avatars/${data.organization_id}/avatar${timeStamp}.${type}`,
        Body: buf,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`
      };
      try {
        const uploadData = await s3bucket.upload(params).promise();
        location = uploadData.Location;
      } catch (error) {
        console.log(error);
        return res.status(200).json({
          statusCode: 500,
          error
        });
      }
    }
    if (data.email) {
      email = data.email;
      const {
        USER_POOL_ID
      } = process.env;
      const params = {
        UserPoolId: USER_POOL_ID,
        Username: data.old_email,
        UserAttributes: [{
          Name: "email",
          Value: data.email
        }, {
          Name: "email_verified",
          Value: "false"
        }]
      };
      await cognito.adminUpdateUserAttributes(params).promise();
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#role_text": "role",
        "#avatar": "avatar",
        "#email": "email",
        "#birth": "birth",
        "#pin": "pin",
        "#type": "type",
        "#state": "state"
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":role": data.role,
        ":type": data.type,
        ":avatar": location,
        ":email": email,
        ":birth": data.birth,
        ":pin": data.pin,
        ":state": true,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #role_text = :role, #type = :type, #avatar = :avatar, #email = :email, #birth = :birth, #pin = :pin, #state = :state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully updated"
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const pin = Math.floor(1000 + Math.random() * 9000);
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const addParams = {
      UserPoolId: process.env.USER_POOL_ID,
      // replace with your User Pool ID
      Username: data.email,
      // replace with the username
      TemporaryPassword: result,
      // replace with a temporary password
      UserAttributes: [{
        Name: "email",
        Value: data.email // replace with the user's email
      }, {
        Name: "email_verified",
        Value: "true"
      }, {
        Name: "custom:role",
        Value: "member"
      }, {
        Name: "custom:user_id",
        Value: data.id
      }, {
        Name: "custom:level",
        Value: "3"
      }, {
        Name: "custom:organization_id",
        Value: data.organization_id
      }],
      MessageAction: "SUPPRESS" // suppresses the welcome message
    };

    await cognito.adminCreateUser(addParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#role_text": "role",
        "#type": "type",
        "#state": "state",
        "#pin": "pin"
      },
      ExpressionAttributeValues: {
        ":role": data.role,
        ":type": data.type,
        ":state": true,
        ":pin": pin,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #role_text = :role, #type = :type, #state = :state, #pin = :pin, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    const inviteLink = "https://user.teamixo.com/invite/" + data.id;
    var emailParams = {
      Destination: {
        ToAddresses: [data.email] // replace recipient@example.com with the recipient's email address
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
          `
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: `You are invited as member from ${data.companyInfo.name}` // replace with your email subject
        }
      },

      Source: "support@teamixo.com" // replace sender@example.com with your "From" address
    };

    await ses.sendEmail(emailParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Upgrade Successful"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Reqeust"
      });
    }
    if (data.state) {
      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: data.email
      };
      await cognito.adminDeleteUser(params).promise();
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfully deleted"
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const permissionParam = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#permission": "permission"
      },
      ExpressionAttributeValues: {
        ":permission": data.permission,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #permission = :permission, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(permissionParam).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Permissions has been successfully added!"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/fetchadmin", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id AND #level = :level",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id",
        "#level": "level"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id,
        ":level": 2
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#level": "level",
        "#permission": "permission",
        "#role": "role"
      },
      ExpressionAttributeValues: {
        ":level": data.level,
        ":permission": data.permission,
        ":role": data.staff_role,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #level = :level, #permission = :permission, #role = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    const cognitoParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: data.email,
      UserAttributes: [{
        Name: "custom:level",
        Value: data.level.toString()
      }, {
        Name: "custom:role",
        Value: data.role
      }]
    };
    await cognito.adminUpdateUserAttributes(cognitoParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff has been successfully down graded"
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#block_state": "block_state"
      },
      ExpressionAttributeValues: {
        ":block_state": data.block_state,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #block_state = :block_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff block state has been successfully changed"
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/emailduplicate", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    var params = {
      TableName: "staff_list",
      FilterExpression: "#email = :email",
      ExpressionAttributeNames: {
        "#email": "email"
      },
      // field to check
      ExpressionAttributeValues: {
        ":email": data.email
      }
    };
    const result = await dynamoDb.scan(params).promise();
    return res.status(200).json({
      statusCode: 200,
      data: result.Items
    });
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const uid = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    const resu = await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.tableName,
        ":last_start_date": roundToNearestFiveMinutes(data.date, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    const response = {
      stsatusCode: 200,
      message: "The staff has been clocked in successfully."
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/start-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    const uid = timeStamp.toString();
    const dateParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: uid,
        staff_id: data.staff.id,
        site_id: data.site.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
        end_date: null,
        total_time: null,
        name: data.staff.name,
        status: "start",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    const resu = await dynamoDb.put(dateParams).promise();
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#track_id": "track_id",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": true,
        ":break_state": false,
        ":track_id": uid,
        ":record_id": uid,
        ":site_id": data.site.id,
        ":last_start_date": roundToNearestFiveMinutes(data.date, data.round),
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #track_id = :track_id, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    const response = {
      stsatusCode: 200,
      message: "The staff has been clocked in successfully."
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
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(data.date, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(data.date, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
        total_time: 0,
        name: data.staff.name,
        status: "end",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":break_state": false,
        ":record_id": null,
        ":site_id": null,
        ":last_start_date": null,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      message: "The staff has been clocked out successfully."
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/end-v1", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request!"
      });
    }
    //calculate the total time from start work to start break
    var differenceInMs = roundToNearestFiveMinutes(data.date, data.round) - data.staff.last_start_date;
    var total_time = differenceInMs;
    const uid = timeStamp.toString();
    // update the start state record with total time and end time
    const updateParams = {
      TableName: data.tableName,
      Key: {
        id: data.staff.record_id
      },
      ExpressionAttributeNames: {
        "#end_date": "end_date",
        "#total_time": "total_time"
      },
      ExpressionAttributeValues: {
        ":end_date": roundToNearestFiveMinutes(data.date, data.round),
        ":total_time": total_time,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #end_date = :end_date, #total_time = :total_time, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();

    // add new record to report table with break state
    const addParams = {
      TableName: data.tableName,
      Item: {
        id: uid,
        track_id: data.staff.track_id,
        staff_id: data.staff.id,
        site_id: data.site.id,
        date: moment__WEBPACK_IMPORTED_MODULE_2___default()(data.date).format("YYYY-MM-DD"),
        start_date: roundToNearestFiveMinutes(data.date, data.round),
        total_time: 0,
        name: data.staff.name,
        status: "end",
        createdAt: timeStamp,
        updateAt: timeStamp
      }
    };
    await dynamoDb.put(addParams).promise();
    const updateUserParam = {
      TableName: "staff_list",
      Key: {
        id: data.staff.id
      },
      ExpressionAttributeNames: {
        "#clocked_state": "clocked_state",
        "#break_state": "break_state",
        "#record_id": "record_id",
        "#site_id": "site_id",
        "#last_start_date": "last_start_date"
      },
      ExpressionAttributeValues: {
        ":clocked_state": false,
        ":break_state": false,
        ":record_id": null,
        ":site_id": null,
        ":last_start_date": null,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clocked_state = :clocked_state, #break_state = :break_state, #record_id = :record_id, #site_id = :site_id, #last_start_date = :last_start_date, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDb.update(updateUserParam).promise();
    const response = {
      stsatusCode: 200,
      message: "The staff has been clocked out successfully."
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json(error);
  }
});
router.post("/setclock", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#clockInTime": "clockInTime",
        "#clockOutTime": "clockOutTime"
      },
      ExpressionAttributeValues: {
        ":clockInTime": data.clockInTime,
        ":clockOutTime": data.clockOutTime,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #clockInTime = :clockInTime, #clockOutTime = :clockOutTime, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff clock time is setted!"
    });
  } catch (error) {
    return res.status(200).json({
      statusCode: 500,
      error: error
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/user/index.js":
/*!**********************************!*\
  !*** ./src/routes/user/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _user_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./user.route */ "./src/routes/user/user.route.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/", _user_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/user/user.route.js":
/*!***************************************!*\
  !*** ./src/routes/user/user.route.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const uuid = __webpack_require__(/*! uuid */ "uuid");
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/signup", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        error: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const userId = timeStamp.toString();
    const params = {
      ClientId: CLIENT_ID,
      Password: data.password,
      Username: data.email,
      UserAttributes: [{
        Name: "email",
        Value: data.email
      }, {
        Name: "custom:user_id",
        Value: userId
      }, {
        Name: "custom:role",
        Value: "owner"
      }, {
        Name: "custom:level",
        Value: "1"
      }, {
        Name: "custom:organization_id",
        Value: userId
      }]
    };
    await cognito.signUp(params).promise();
    const pin = Math.floor(1000 + Math.random() * 9000);
    var staffItems = {
      id: userId,
      organization_id: userId,
      email: data.email,
      name: data.fname,
      first_name: data.firstName,
      last_name: data.lastName,
      avatar: process.env.DEFAULT_AVATAR,
      pin: pin,
      role: ["owner"],
      level: 1,
      type: 1,
      site_id: null,
      track_id: null,
      clocked_state: false,
      state: true,
      last_start_date: null,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const staffParams = {
      TableName: "staff_list",
      Item: staffItems
    };
    await dynamoDb.put(staffParams).promise();
    res.status(200).json({
      statusCode: 200,
      message: "User registration successful",
      response: staffItems
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});
router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      USER_POOL_ID,
      CLIENT_ID
    } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password
      }
    };
    const response = await cognito.adminInitiateAuth(params).promise();
    res.status(200).json({
      statusCode: 200,
      message: "Login succeed",
      token: response.AuthenticationResult.IdToken,
      accessToken: response.AuthenticationResult.AccessToken
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});
router.post("/confirmEmail", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const params = {
      ClientId: CLIENT_ID,
      Username: data.email,
      ConfirmationCode: data.confirmCode
    };
    const response = await cognito.confirmSignUp(params).promise();
    res.status(200).json({
      statusCode: 200,
      message: `Confirm succeffsul about ${data.email}`,
      response: response
    });
  } catch (error) {
    console.error("An error occured:", error);
    res.status(200).json({
      statusCode: 400,
      data: {
        message: "Verification code is not correct",
        error: error
      }
    });
  }
});
router.post("/forgot", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const params = {
      ClientId: CLIENT_ID,
      // replace with your App client id
      Username: data.useremail // replace with the username
    };

    const response = await cognito.forgotPassword(params).promise();
    return res.status(200).json({
      statusCode: 200,
      response
    });
  } catch (error) {
    console.log("An error occured:", error);
    res.status(200).json(error);
  }
});
router.post("/setpassword", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    var verifyParams = {
      UserPoolId: process.env.USER_POOL_ID,
      // replace with your User Pool ID
      Username: data.email,
      // replace with the user's username
      Password: data.password,
      // replace with the user's real password
      Permanent: true
    };
    const response = await cognito.adminSetUserPassword(verifyParams).promise();
    const passwordStateParam = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#password_state": "password_state"
      },
      ExpressionAttributeValues: {
        ":password_state": true,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #password_state = :password_state, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(passwordStateParam).promise();
    return res.status(200).json({
      statusCode: 200,
      response
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/confirmforgot", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const params = {
      ClientId: CLIENT_ID,
      // replace with your App client id
      Username: data.username,
      // replace with the username
      ConfirmationCode: data.confirmationCode,
      // replace with the confirmation code
      Password: data.newPassword // replace with the new password
    };

    const response = await cognito.confirmForgotPassword(params).promise();
    return res.status(200).json({
      statusCode: 200,
      response,
      message: "Password has been changed successfully."
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/changeEmail", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      USER_POOL_ID
    } = process.env;
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: data.oldEmail,
      UserAttributes: [{
        Name: "email",
        Value: data.newEmail
      }, {
        Name: "email_verified",
        Value: "false"
      }]
    };
    const response = await cognito.adminUpdateUserAttributes(params).promise();
    const staffParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#email": "email"
      },
      ExpressionAttributeValues: {
        ":email": data.newEmail,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #email = :email, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(staffParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Email has been successfully updated",
      data: response
    });
  } catch (error) {
    return res.status(200).json(error);
  }
});
router.post("/resend", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      AccessToken: data.accessToken,
      AttributeName: "email"
    };
    await cognito.getUserAttributeVerificationCode(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Verification code resent successfully."
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 500,
      body: {
        message: "Failed to resend verification code",
        error: error
      }
    });
  }
});
router.post("/emailverify", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(200).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      AccessToken: data.accessToken,
      // The user's access token
      AttributeName: "email",
      // Attribute you are verifying
      Code: data.confirmCode // The verification code submitted by the user
    };

    await cognito.verifyUserAttribute(params).promise();
    console.log("Email verified successfully");
    return res.status(200).json({
      statusCode: 200,
      body: {
        message: "Email verified successfully"
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 500,
      error: error,
      body: {
        message: "Email verification code is not correct.",
        error: error
      }
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/admin/company.js":
/*!****************************************!*\
  !*** ./src/routes/v1/admin/company.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const DBController = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB)();
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/delete_sites", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the delete ID"
      });
    }
    const scanParams = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id
      }
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(scanParams).promise();
      items.Items.forEach(item => scanResults.push(item));
      scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const site of scanResults) {
      const deleteParams = {
        TableName: "site_list",
        Key: {
          id: site.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      message: "All site data has been successfully deleted!"
    });
  } catch (error) {
    console.log("Error occured in delete site", error);
    return res.status(500).json({
      message: "Server Error!",
      error: error
    });
  }
});
router.post("/delete_roles", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the delete ID"
      });
    }
    const scanParams = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id
      }
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(scanParams).promise();
      items.Items.forEach(item => scanResults.push(item));
      scanParams.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const role of scanResults) {
      const deleteParams = {
        TableName: "role_list",
        Key: {
          id: role.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      message: "All role data has been successfully deleted!"
    });
  } catch (error) {
    console.log("Error occured in delete site", error);
    return res.status(500).json({
      message: "Server Error!",
      error: error
    });
  }
});
router.post("/delete_tracks", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the delete ID"
      });
    }
    const deleteTrackTableParams = {
      TableName: "record_" + data.id
    };
    await DBController.deleteTable(deleteTrackTableParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Track record data has been successfully deleted!"
    });
  } catch (error) {
    console.log("Error occured: ", error);
    return res.status(200).json({
      message: "Server Error!",
      error: error
    });
  }
});
router.post("/delete_staffs", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the delete ID"
      });
    }
    const params = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.id // Replace 'YourId' with the id you want to delete
      }
    };

    const scanResults = [];
    let items;
    do {
      items = await dynamoDb.scan(params).promise();
      items.Items.forEach(item => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    for (const item of scanResults) {
      const userParam = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: item.email
      };
      await cognito.adminDeleteUser(userParam).promise();
      const deleteParams = {
        TableName: "staff_list",
        Key: {
          id: item.id
        }
      };
      await dynamoDb.delete(deleteParams).promise();
    }
    return res.status(200).json({
      statusCode: 200,
      message: "All staffs data has been successfully deleted"
    });
  } catch (error) {
    console.log("Error Occured: ", error);
    return res.status(500).json({
      message: "Server Error!",
      error: error
    });
  }
});
router.post("/delete_company", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the delete ID"
      });
    }
    const deleteCompanyParams = {
      TableName: "company_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(deleteCompanyParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Company data has been successfully deleted!"
    });
  } catch (error) {
    console.log("Error Occured: ", error);
    return res.status(500).json({
      message: "Server Error!",
      error: error
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/admin/index.js":
/*!**************************************!*\
  !*** ./src/routes/v1/admin/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _company__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./company */ "./src/routes/v1/admin/company.js");


const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/company", _company__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/books.route.js":
/*!**************************************!*\
  !*** ./src/routes/v1/books.route.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);

const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.get("/", async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(200).json(error);
  }
});
router.get("/:id", async (req, res) => {
  try {
    res.status(200).json({});
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(500).json(error);
  }
});
router.post("/", async (req, res) => {
  try {
    res.status(201).json({});
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json(error);
  }
});
router.put("/:id", async (req, res) => {
  try {
    res.status(200).json({});
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json(error);
  }
});
router.delete("/:id", async (req, res) => {
  try {
    res.status(200).json({});
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/index.js":
/*!********************************!*\
  !*** ./src/routes/v1/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _books_route__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./books.route */ "./src/routes/v1/books.route.js");
/* harmony import */ var _admin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./admin */ "./src/routes/v1/admin/index.js");
/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./server */ "./src/routes/v1/server/index.js");




const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/books", _books_route__WEBPACK_IMPORTED_MODULE_1__["default"]);
router.use("/admin", _admin__WEBPACK_IMPORTED_MODULE_2__["default"]);
router.use("/server", _server__WEBPACK_IMPORTED_MODULE_3__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/auth.js":
/*!**************************************!*\
  !*** ./src/routes/v1/server/auth.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/routes/v1/utils.js");




const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      USER_POOL_ID,
      CLIENT_ID
    } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password
      }
    };
    const response = await cognito.adminInitiateAuth(params).promise();
    const IdToken = response.AuthenticationResult.IdToken;
    const AccessToken = response.AuthenticationResult.AccessToken;
    const userInfo = jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default().decode(response.AuthenticationResult.IdToken);
    if (userInfo["custom:level"] == 3) {
      return res.status(404).json({
        message: "User has not permission to login server side."
      });
    }
    const userId = userInfo["custom:user_id"];
    const getUserParams = {
      TableName: "staff_list",
      Key: {
        id: userId
      }
    };
    const userResult = await dynamoDb.get(getUserParams).promise();
    const user = userResult.Item;
    res.status(200).json({
      statusCode: 200,
      message: "Login succeed",
      user: user,
      token: IdToken,
      accessToken: AccessToken
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(500).json(error);
  }
});
router.post("/signup", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const userId = timeStamp.toString();
    const params = {
      ClientId: CLIENT_ID,
      Password: data.password,
      Username: data.email,
      UserAttributes: [{
        Name: "email",
        Value: data.email
      }, {
        Name: "custom:user_id",
        Value: userId
      }, {
        Name: "custom:role",
        Value: "owner"
      }, {
        Name: "custom:level",
        Value: "1"
      }, {
        Name: "custom:organization_id",
        Value: userId
      }]
    };
    await cognito.signUp(params).promise();
    const pin = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.GeneratePin)();
    var staffItems = {
      id: userId,
      organization_id: userId,
      email: data.email,
      name: data.fname,
      first_name: data.firstName,
      last_name: data.lastName,
      avatar: process.env.DEFAULT_AVATAR,
      pin: pin,
      role: "owner",
      level: 1,
      type: 1,
      site_id: null,
      track_id: null,
      clocked_state: false,
      state: true,
      last_start_date: null,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const staffParams = {
      TableName: "staff_list",
      Item: staffItems
    };
    await dynamoDb.put(staffParams).promise();
    res.status(200).json({
      statusCode: 200,
      message: "User registration successful",
      response: staffItems
    });
  } catch (error) {
    console.error("An error ocurred:", error);
    res.status(500).json(error);
  }
});
router.post("/verify-email", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const {
      CLIENT_ID
    } = process.env;
    const params = {
      ClientId: CLIENT_ID,
      Username: data.email,
      ConfirmationCode: data.confirmCode
    };
    const response = await cognito.confirmSignUp(params).promise();
    res.status(200).json({
      statusCode: 200,
      message: `Confirm succeffsul about ${data.email}`,
      response: response
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({
      message: "Verification code is not correct",
      error: error
    });
  }
});
router.post("/getMe", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.userId
      }
    };
    const user = await dynamoDb.get(params).promise();
    const response = {
      statusCode: 200,
      body: {
        user: user
      }
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/company.js":
/*!*****************************************!*\
  !*** ./src/routes/v1/server/company.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


var ddb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB)({
  apiVersion: "2012-08-10"
});
const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/create", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(404).json({
        statusCode: 404,
        message: "Bad Request"
      });
    }
    const record_table = "record_" + data.organizationId;
    const Item = {
      id: data.organizationId,
      email: data.email,
      state: "free",
      name: data.name,
      city: data.city,
      country: data.country,
      currency: data.currency,
      address: data.address,
      address_sec: data.address_sec,
      postcode: data.postCode,
      telephone: data.telePhone,
      organization_id: data.organizationId,
      timeZone: data.timeZone,
      logo: process.env.DEFAULT_COMPANY_LOGO,
      date_format: "DD-MM-YYYY",
      record_table: record_table,
      type: 1,
      round: 5,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const companyCreateParams = {
      TableName: "company_list",
      Item
    };
    const response = await dynamoDb.put(companyCreateParams).promise();
    const params = {
      TableName: record_table,
      KeySchema: [{
        AttributeName: "id",
        KeyType: "HASH"
      }],
      AttributeDefinitions: [{
        AttributeName: "id",
        AttributeType: "S"
      }],
      BillingMode: "PAY_PER_REQUEST"
    };
    await ddb.createTable(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "success create",
      data: response
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/department.js":
/*!********************************************!*\
  !*** ./src/routes/v1/server/department.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request."
      });
    }
    const getParams = {
      TableName: "role_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(getParams).promise();
    return res.status(200).json({
      statusCode: 200,
      body: result.Items
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
router.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const timeStamp = new Date().getTime();
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    let Item = {
      id: timeStamp.toString(),
      organization_id: data.organization_id,
      role: data.department,
      createAt: timeStamp,
      updateAt: timeStamp
    };
    const createParams = {
      TableName: "role_list",
      Item
    };
    await dynamoDb.put(createParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "New department has been successfully created"
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "role_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#role_text": "role"
      },
      ExpressionAttributeValues: {
        ":role": data.department,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Department has been successfully updated"
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const deleteDepartmentParams = {
      TableName: "role_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(deleteDepartmentParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Department data has been successfilly deleted."
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/index.js":
/*!***************************************!*\
  !*** ./src/routes/v1/server/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./auth */ "./src/routes/v1/server/auth.js");
/* harmony import */ var _staff__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./staff */ "./src/routes/v1/server/staff.js");
/* harmony import */ var _report__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./report */ "./src/routes/v1/server/report.js");
/* harmony import */ var _company__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./company */ "./src/routes/v1/server/company.js");
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./service */ "./src/routes/v1/server/service.js");
/* harmony import */ var _department__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./department */ "./src/routes/v1/server/department.js");







const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.use("/auth", _auth__WEBPACK_IMPORTED_MODULE_1__["default"]);
router.use("/staff", _staff__WEBPACK_IMPORTED_MODULE_2__["default"]);
router.use("/report", _report__WEBPACK_IMPORTED_MODULE_3__["default"]);
router.use("/company", _company__WEBPACK_IMPORTED_MODULE_4__["default"]);
router.use("/service", _service__WEBPACK_IMPORTED_MODULE_5__["default"]);
router.use("/department", _department__WEBPACK_IMPORTED_MODULE_6__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/report.js":
/*!****************************************!*\
  !*** ./src/routes/v1/server/report.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);



const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const getReportParams = {
      TableName: data.tableName
    };
    const result = await dynamoDb.scan(getReportParams).promise();
    return res.status(200).json({
      statusCode: 200,
      body: result
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
router.post("/add_track", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request!"
      });
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
          date: moment__WEBPACK_IMPORTED_MODULE_2___default()(item.start_date).format("YYYY-MM-DD"),
          start_date: item.start_date,
          end_date: item.end_date,
          total_time: item.total_time,
          name: data.staff.name,
          status: item.status,
          track_type: 1,
          createdAt: timeStamp,
          updateAt: timeStamp
        }
      };
      await dynamoDb.put(dateParams).promise();
    });
    await Promise.all(promise);
    return res.status(200).json({
      statusCode: 200,
      message: `Track data has been successfully created`
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
      return res.status(400).json({
        message: "Bad Request!"
      });
    }
    const params = {
      TableName: data.tableName,
      FilterExpression: "#track_id = :track_id",
      ExpressionAttributeNames: {
        "#track_id": "track_id"
      },
      ExpressionAttributeValues: {
        ":track_id": data.track_id // Replace 'YourId' with the id you want to delete
      }
    };

    await queryAndDeleteDynamoDB(params);
    return res.status(200).json({
      statusCode: 200,
      message: "The report data has been deleted."
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
router.post("/get_track", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const getTrackParams = {
      TableName: data.table_name,
      FilterExpression: "#track_id = :track_id",
      ExpressionAttributeNames: {
        "#track_id": "track_id"
      },
      ExpressionAttributeValues: {
        ":track_id": data.track_id
      }
    };
    const tracks = await dynamoDb.scan(getTrackParams).promise();
    const getServiceParams = {
      TableName: "site_list",
      Key: {
        id: tracks.Items[0].site_id
      }
    };
    const service = await dynamoDb.get(getServiceParams).promise();
    const getStaffParams = {
      TableName: "staff_list",
      Key: {
        id: tracks.Items[0].staff_id
      }
    };
    const staff = await dynamoDb.get(getStaffParams).promise();
    return res.status(200).json({
      tracks: tracks.Items,
      service: service.Item,
      staff: staff.Item
    });
  } catch (err) {
    console.log("Error is occurred: ", err);
    return res.status(500).json(err);
  }
});

// ---------------------------------------------------

async function queryAndDeleteDynamoDB(params) {
  const data = await dynamoDb.scan(params).promise();
  for (let item of data.Items) {
    const deleteParams = {
      TableName: params.TableName,
      Key: {
        id: item.id
      }
    };
    await dynamoDb.delete(deleteParams).promise();
  }
  if (data.LastEvaluatedKey) {
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    return queryAndDeleteDynamoDB(params);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/service.js":
/*!*****************************************!*\
  !*** ./src/routes/v1/server/service.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);


const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(404).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organizationId
      }
    };
    const result = await dynamoDb.scan(params).promise();
    const response = {
      statusCode: 200,
      body: result.Items
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
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Requrest!"
      });
    }
    let Item = data;
    Item.id = timeStamp.toString();
    Item.createAt = timeStamp;
    Item.updateAt = timeStamp;
    Item.table_name = "record_" + data.organization_id;
    const createServiceParams = {
      TableName: "site_list",
      Item
    };
    await dynamoDb.put(createServiceParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Service has been successfully created."
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.state(500).json(error.message);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const deleteServiceParams = {
      TableName: "site_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(deleteServiceParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Service data has been successfilly deleted."
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});
router.post("/getservice", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request."
      });
    }
    const getParams = {
      TableName: "site_list",
      Key: {
        id: data.id
      }
    };
    const service = await dynamoDb.get(getParams).promise();
    return res.status(200).json({
      statusCode: 200,
      service: service
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "site_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#name_text": "name",
        "#description_text": "description",
        "#round": "round",
        "#radius": "radius",
        "#remote": "remote",
        "#address": "address",
        "#lat": "lat",
        "#lng": "lng"
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
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #name_text = :name, #description_text = :description, #round = :round, #radius = :radius, #remote = :remote, #address = :address, #lat = :lat, #lng = :lng, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Service data has been successfully updated"
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/server/staff.js":
/*!***************************************!*\
  !*** ./src/routes/v1/server/staff.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_upload_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/upload-util */ "./src/routes/v1/utils/upload-util.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/routes/v1/utils.js");




const dynamoDb = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().DynamoDB).DocumentClient();
const cognito = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().CognitoIdentityServiceProvider)();
const router = (0,express__WEBPACK_IMPORTED_MODULE_1__.Router)();
router.post("/fetch_staff", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request. Server can't find the ID"
      });
    }
    const fetchParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    const user = await dynamoDb.get(fetchParams).promise();
    return res.status(200).json({
      data: user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});
router.post("/update_persional", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request: server can't find the update params!"
      });
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
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
        "#phone_sec": "phone_sec"
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
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #full_name = :full_name, #name_f = :name_f, #name_m = :name_m, #name_l = :name_l, #gender = :gender, #birth = :birth, #emergency_name = :emergency_name, #emergency_employee = :emergency_employee, #emergency_phone = :emergency_phone, #address = :address, #address_sec = :address_sec, #city = :city, #country = :country, #postcode = :postcode, #email = :email, #email_sec = :email_sec, #phone = :phone, #phone_sec = :phone_sec, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      message: "Staff personal information has been successfully updated"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});
router.post("/update_salary", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request: server can't find the update params!"
      });
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#salary": "salary"
      },
      ExpressionAttributeValues: {
        ":salary": data.salary,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #salary = :salary, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      message: "Staff persional information has been successfully updated"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});
router.post("/list", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request."
      });
    }
    const getParams = {
      TableName: "staff_list",
      FilterExpression: "#organization_id = :organization_id",
      ExpressionAttributeNames: {
        "#organization_id": "organization_id"
      },
      ExpressionAttributeValues: {
        ":organization_id": data.organization_id
      }
    };
    const result = await dynamoDb.scan(getParams).promise();
    return res.status(200).json({
      statusCode: 200,
      body: result.Items
    });
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
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const params = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#role_text": "role"
      },
      ExpressionAttributeValues: {
        ":role": data.department,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #role_text = :role, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(params).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Update Successful"
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
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    const tempPassword = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.TemporaryPasswordGenerator)();
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      // replace with your User Pool ID
      Username: data.email,
      // replace with the username
      TemporaryPassword: tempPassword,
      // replace with a temporary password
      UserAttributes: [{
        Name: "email",
        Value: data.email // replace with the user's email
      }, {
        Name: "email_verified",
        Value: "true"
      }, {
        Name: "custom:role",
        Value: "member"
      }, {
        Name: "custom:user_id",
        Value: timeStamp.toString()
      }, {
        Name: "custom:level",
        Value: "3"
      }, {
        Name: "custom:organization_id",
        Value: data.organization_id
      }],
      MessageAction: "SUPPRESS" // suppresses the welcome message
    };

    await cognito.adminCreateUser(params).promise();
    const avatarUrl = await (0,_utils_upload_util__WEBPACK_IMPORTED_MODULE_2__.UploadImage)(data.avatar.base64, data.organization_id, timeStamp);
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
      Item
    };
    await dynamoDb.put(createStaffParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff has been successfully created."
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});
router.post("/delete", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request"
      });
    }
    if (data.state) {
      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: data.email
      };
      await cognito.adminDeleteUser(params).promise();
    }
    const deleteStaffParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    await dynamoDb.delete(deleteStaffParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff data has been successfilly deleted."
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error.message);
  }
});
router.post("/getstaff", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request."
      });
    }
    const getParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      }
    };
    const staff = await dynamoDb.get(getParams).promise();
    return res.status(200).json({
      statusCode: 200,
      staff: staff
    });
  } catch (error) {
    console.log("Error occurred: ", error);
    return res.status(500).json(error);
  }
});
router.post("/update", async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    const data = req.body;
    if (!data) {
      return res.status(400).json({
        message: "Bad Request: server can't find the update params!"
      });
    }
    let avatarUrl = data.avatar.avatarUrl;
    if (data.avatar.base64) {
      avatarUrl = await (0,_utils_upload_util__WEBPACK_IMPORTED_MODULE_2__.UploadImage)(data.avatar.base64, data.organization_id, timeStamp);
    }
    const updateParams = {
      TableName: "staff_list",
      Key: {
        id: data.id
      },
      ExpressionAttributeNames: {
        "#address": "address",
        "#avatar": "avatar",
        "#birth": "birth",
        "#city": "city",
        "#country": "country",
        "#email": "email",
        "#emergency_employee": "emergency_employee",
        "#emergency_name": "emergency_name",
        "#emergency_phone": "emergency_phone",
        "#first_name": "first_name",
        "#gender": "gender",
        "#last_name": "last_name",
        "#name": "name",
        "#phone": "phone",
        "#pin": "pin",
        "#postcode": "postcode",
        "#role": "role",
        "#salary": "salary",
        "#type": "type"
      },
      ExpressionAttributeValues: {
        ":address": data.address,
        ":avatar": avatarUrl,
        ":birth": data.birth,
        ":city": data.city,
        ":country": data.country,
        ":email": data.email,
        ":emergency_employee": data.emergency_employee,
        ":emergency_name": data.emergency_name,
        ":emergency_phone": data.emergency_phone,
        ":first_name": data.first_name,
        ":gender": data.gender,
        ":last_name": data.last_name,
        ":name": data.name,
        ":phone": data.phone,
        ":pin": data.pin,
        ":postcode": data.postcode,
        ":role": data.role,
        ":salary": data.salary,
        ":type": data.type,
        ":updateAt": timeStamp
      },
      UpdateExpression: "SET #address = :address, #avatar = :avatar, #birth = :birth, #city = :city, #country = :country, #email = :email, #emergency_employee = :emergency_employee, #emergency_name = :emergency_name, #emergency_phone = :emergency_phone, #first_name = :first_name, #gender = :gender, #last_name = :last_name, #name = :name, #phone = :phone, #pin = :pin, #postcode = :postcode, #role = :role, #salary = :salary, #type = :type, updateAt = :updateAt",
      ReturnValues: "ALL_NEW"
    };
    await dynamoDb.update(updateParams).promise();
    return res.status(200).json({
      statusCode: 200,
      message: "Staff has been successfully updated."
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router);

/***/ }),

/***/ "./src/routes/v1/utils.js":
/*!********************************!*\
  !*** ./src/routes/v1/utils.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GeneratePin: () => (/* binding */ GeneratePin),
/* harmony export */   TemporaryPasswordGenerator: () => (/* binding */ TemporaryPasswordGenerator)
/* harmony export */ });
function GeneratePin() {
  return Math.floor(1000 + Math.random() * 9000);
}
function TemporaryPasswordGenerator() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/***/ }),

/***/ "./src/routes/v1/utils/upload-util.js":
/*!********************************************!*\
  !*** ./src/routes/v1/utils/upload-util.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UploadImage: () => (/* binding */ UploadImage)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);

const s3bucket = new (aws_sdk__WEBPACK_IMPORTED_MODULE_0___default().S3)();
async function UploadImage(data, organization_id, timeStamp) {
  var buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const type = data.split(";")[0].split("/")[1];
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `Home/Avatars/${organization_id}/avatar${timeStamp}.${type}`,
    Body: buf,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: `image/${type}`
  };
  try {
    const uploadData = await s3bucket.upload(params).promise();
    return uploadData.Location;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("moment");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("multer");

/***/ }),

/***/ "serverless-http":
/*!**********************************!*\
  !*** external "serverless-http" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("serverless-http");

/***/ }),

/***/ "stripe":
/*!*************************!*\
  !*** external "stripe" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stripe");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handler: () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var serverless_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! serverless-http */ "serverless-http");
/* harmony import */ var serverless_http__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(serverless_http__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cors */ "cors");
/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! body-parser */ "body-parser");
/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _routes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./routes */ "./src/routes/index.js");





const app = express__WEBPACK_IMPORTED_MODULE_0___default()();
app.use(cors__WEBPACK_IMPORTED_MODULE_2___default()());
app.use(body_parser__WEBPACK_IMPORTED_MODULE_3___default().json({
  limit: "10mb"
}));
app.use(body_parser__WEBPACK_IMPORTED_MODULE_3___default().urlencoded({
  limit: "10mb",
  extended: true
}));
app.use(express__WEBPACK_IMPORTED_MODULE_0___default().json());
app.use("/api", _routes__WEBPACK_IMPORTED_MODULE_4__["default"]);
app.use((req, res, next) => {
  res.status(404).send();
});
app.use((err, req, res, next) => {
  res.status(err.status || 500).send();
});
const handler = serverless_http__WEBPACK_IMPORTED_MODULE_1___default()(app);
})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=app.js.map