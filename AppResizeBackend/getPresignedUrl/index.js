const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
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
    body: JSON.stringify({ uploadURL }),
  };
};
