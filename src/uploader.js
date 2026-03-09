const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const s3 = new S3Client({});

module.exports.handler = async (event) => {
  try {
    const fileName = event.queryStringParameters?.fileName || 'upload.jpg';
    const contentType = event.queryStringParameters?.contentType || 'image/jpeg';

    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing fileName or contentType query parameter" })
      };
    }

    // Generate unique file name to avoid overwriting
    const randomId = crypto.randomBytes(8).toString('hex');
    const secureFileName = `${randomId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.RAW_BUCKET,
      Key: secureFileName,
      ContentType: contentType,
    });

    // Provide a pre-signed URL valid for 5 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uploadUrl, fileName: secureFileName })
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: "Failed to generate upload URL", error: error.message })
    };
  }
};
