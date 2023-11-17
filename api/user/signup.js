const AWS = require('aws-sdk')
const { sendResponse, validateInput } = require("../utils/utils")

const cognito = new AWS.CognitoIdentityServiceProvider()

module.exports.handler = async (event) => {
    try {
        const isVaild = validateInput(event.body)
        if (!isVaild)
            return sendResponse(400, { message: 'Invaild input' })

        const { email, password } = JSON.parse(event.body)
        const { USER_POOL_ID, CLIENT_ID } = process.env
        const params = {
            ClientId: CLIENT_ID,
            Password: password,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
            ],
        }
        const response = await cognito.signUp(params).promise();
        return sendResponse(200, { message: 'User registration successful', response: response })
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error'
        return sendResponse(500, { message })
    }
}