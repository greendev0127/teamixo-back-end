const AWS = require("aws-sdk")
const utils = require("./utils")

module.exports.handler = async (event) => {
    try {
        const s3bucket = new AWS.S3();

        // const userEmail = event.requestContext.authorizer.claims.email;

        const reqData = JSON.parse(event.body)
        var buf = Buffer.from(reqData.imgFile.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        const type = reqData.imgFile.split(';')[0].split('/')[1];
        let prompt = reqData.prompt;
        if (prompt.length > 20) {
            prompt = prompt.slice(0, 20)
        }
        let ts = Date.now();
        let date_time = new Date(ts)
        let date = date_time.getDate()
        let month = date_time.getMonth() + 1;
        let year = date_time.getFullYear();
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `Home/uploads/${year}/${month}/${date}/${prompt}_${ts}_input.${type}`,
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: `image/${type}`
        }
        let location = ''
        try {

            const uploadData = await s3bucket.upload(params).promise();
            location = uploadData.Location;
        } catch (error) {
            console.log(error)
            return utils.responseData(500, { message: "Internal server error" })
        }
        const responseData = {
            location: location
        }
        return utils.sendResponse(200, responseData);
    } catch (err) {
        console.log(`Error Occurs ${err}`);
    }
}