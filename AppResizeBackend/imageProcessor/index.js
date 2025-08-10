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

    console.log("Resizing image...");
    const resizedBuffer = await sharp(originalImage.Body)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })  
      .toBuffer();

    const resizedKey = key.replace("original", "resized");
    console.log(`Uploading resized image to: ${resizedKey}`);

    await S3.putObject({
      Bucket: bucket,
      Key: resizedKey,
      Body: resizedBuffer,
      ContentType: 'image/jpeg',
    }).promise();

    console.log("Image resized and uploaded successfully.");
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image resized and uploaded",
        originalKey: key,
        resizedKey: resizedKey,
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
