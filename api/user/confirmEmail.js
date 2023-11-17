const AWS = require('aws-sdk')
const { sendResponse, validateInput } = require("../utils/utils");

const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports.handler = async (event) => {
    try {
        const { email, confirmCode } = JSON.parse(event.body)
        console.log("111111111111", email, confirmCode)
        const { CLIENT_ID } = process.env
        const params = {
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: confirmCode
        }
        console.log("2222222222222", email, confirmCode)
        const response = await cognito.confirmSignUp(params).promise();
        return sendResponse(200, { message: `Confirm succeffsul about ${email}` })
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error';
        return sendResponse(500, { message })
    }
}