import AWS from "aws-sdk";
const s3bucket = new AWS.S3();

export async function UploadImage(data, organization_id, timeStamp) {
  var buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const type = data.split(";")[0].split("/")[1];

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `Home/Avatars/${organization_id}/avatar${timeStamp}.${type}`,
    Body: buf,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: `image/${type}`,
  };

  try {
    const uploadData = await s3bucket.upload(params).promise();

    return uploadData.Location;
  } catch (error) {
    console.log(error);
    return error;
  }
}
