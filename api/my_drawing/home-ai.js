const axios = require('axios');
const AWS = require('aws-sdk')
const utils = require("../utils/utils");

module.exports.handler = async (event) => {
    try {
        if (!event.body) {
            return utils.sendResponse(400, {
                message: "Bad Request"
            });
        }

        const reqData = JSON.parse(event.body);
        const predictData = {
            model_t: "mlsd",
            image: reqData.image,
            prompt: reqData.prompt
        }
        const body = {
            input: predictData,
        }

        const headers = {
            "Content-Type": "application/json"
        }

        const response = await axios.post(process.env.BASE_MY_MODEL_URL, body, {
            headers: headers
        });

        if (response.status !== 200) {
            let error = response;
            return utils.sendResponse(400, { message: "Server Error", data: error.detail })
        }

        const s3bucket = new AWS.S3();
        var buf = Buffer.from(response.data.output[1].replace(/^data:image\/\w+;base64,/, ""), 'base64')
        const type = response.data.output[1].split(';')[0].split('/')[1];
        let ts = Date.now();
        let date_time = new Date(ts)
        let date = date_time.getDate()
        let month = date_time.getMonth() + 1;
        let year = date_time.getFullYear();

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `Home/uploads/${year}/${month}/${date}/${reqData.prompt}_${ts}_out.${type}`,
            Body: buf,
            ACL: 'public-read',
            ContentType: `binary/octet-stream`
        }

        const uploadImage = await s3bucket.upload(params).promise();
        const sendData = {
            output: uploadImage.Location
        }

        return utils.sendResponse(200, sendData);
    } catch (err) {
        return utils.sendResponse(500, { message: "Couldn't generate image!" });
    }
}