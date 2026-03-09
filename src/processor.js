const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const path = require('path');

const s3 = new S3Client({});

const streamToBuffer = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });

module.exports.handler = async (event) => {
    console.log('Received S3 event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        try {
            // 1. Download original image
            const getObjectParams = {
                Bucket: bucket,
                Key: key,
            };
            console.log(`Downloading ${key} from ${bucket}...`);
            const response = await s3.send(new GetObjectCommand(getObjectParams));
            const imageBuffer = await streamToBuffer(response.Body);

            // 2. Process image with sharp (Resize and convert to WebP)
            console.log(`Processing ${key}...`);
            const processedBuffer = await sharp(imageBuffer)
                .resize(800) // Resize to max 800px width, maintaining aspect ratio
                .webp({ quality: 80 }) // Convert to WebP format
                .toBuffer();

            // 3. Upload to processed bucket
            const parsedKey = path.parse(key);
            const processedKey = `${parsedKey.name}.webp`;
            const processedBucket = process.env.PROCESSED_BUCKET;

            console.log(`Uploading ${processedKey} to ${processedBucket}...`);
            const putObjectParams = {
                Bucket: processedBucket,
                Key: processedKey,
                Body: processedBuffer,
                ContentType: 'image/webp',
            };

            await s3.send(new PutObjectCommand(putObjectParams));
            console.log(`Successfully processed and uploaded ${processedKey}`);

        } catch (error) {
            console.error(`Error processing ${key} from ${bucket}:`, error);
            throw error; // Rethrow to let Serverless know the invocation failed
        }
    }
};
