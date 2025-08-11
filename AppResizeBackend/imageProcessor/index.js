const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');
const path = require('path');

exports.handler = async (event) => {
  console.log("EVENT RECEIVED:", JSON.stringify(event, null, 2));

  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  if (!key.startsWith("uploads/original/")) {
    console.log("Skipping file not in uploads/original/:", key);
    return;
  }

  try {
    console.log(`Fetching original image from: ${bucket}/${key}`);
    const originalImage = await S3.getObject({ Bucket: bucket, Key: key }).promise();

    const beforeSize = originalImage.Body.length;
    console.log(`Original size: ${beforeSize} bytes`);

    console.log("Resizing image...");
    const resizedBuffer = await sharp(originalImage.Body)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const afterSize = resizedBuffer.length;
    console.log(`Resized size: ${afterSize} bytes`);
    const resizedKey = key.replace(/^uploads\/original\//, 'uploads/resized/');
    const region = process.env.AWS_REGION || 'ap-southeast-2';
    const resizedUrl = `https://${bucket}.s3.${region}.amazonaws.com/${resizedKey}`;
 
    console.log(`Uploading resized image to: ${resizedKey}`);

    await S3.putObject({
      Bucket: bucket,
      Key: resizedKey,
      Body: resizedBuffer,
      ContentType: 'image/jpeg',
    }).promise();

    console.log("Image resized and uploaded successfully.");
    console.log(`Uploaded resized image to: ${resizedUrl}`);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST",
      },
      body: JSON.stringify({
        message: "Image resized and uploaded",
        originalKey: key,
        resizedUrl:resizedUrl 
      }),
    };
  } catch (error) {
    console.error("Error processing image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
