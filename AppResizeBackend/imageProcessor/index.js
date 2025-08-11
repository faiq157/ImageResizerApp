const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp'); 

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

    // Before size (in bytes)
    const beforeSize = originalImage.Body.length;
    console.log(`Original size: ${beforeSize} bytes`);

    console.log("Resizing image...");
    const resizedBuffer = await sharp(originalImage.Body)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })  
      .toBuffer();

    // After size (in bytes)
    const afterSize = resizedBuffer.length;
    console.log(`Resized size: ${afterSize} bytes`);

    const resizedKey = key.replace("original", "resized");
    console.log(`Uploading resized image to: ${resizedKey}`);

   await S3.putObject({
  Bucket: bucket,
  Key: resizedKey.replace("resized/", "resized/meta.json"),
  Body: JSON.stringify({
    originalKey: key,
    resizedKey,
    beforeSizeBytes: beforeSize,
    afterSizeBytes: afterSize,
    resizedUrl
  }),
  ContentType: 'application/json'
}).promise();

    console.log("Image resized and uploaded successfully.");
    
    // Public URL for the resized image
    const resizedUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${resizedKey}`;

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
        resizedKey: resizedKey,
        beforeSizeBytes: beforeSize,
        afterSizeBytes: afterSize,
        resizedUrl: resizedUrl
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
