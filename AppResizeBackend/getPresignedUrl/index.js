const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const fileName = event.queryStringParameters.fileName;
    const fileType = event.queryStringParameters.fileType;

    const params = {
      Bucket: process.env.BUCKET_NAME || "image-resizer-uploads",
      Key: `uploads/original/${fileName}`,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadURL = s3.getSignedUrl('putObject', params);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST",
      },
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Error generating presigned URL" }),
    };
  }
};
