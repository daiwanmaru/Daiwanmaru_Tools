import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

async function main() {
    const s3 = new S3Client({
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
    });

    const bucketName = process.env.S3_BUCKET || '';
    if (!bucketName) {
        console.error('❌ S3_BUCKET is not set in .env');
        process.exit(1);
    }

    console.log(`Setting CORS for bucket: ${bucketName}...`);

    try {
        await s3.send(new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ['*'],
                        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                        AllowedOrigins: [
                            'http://localhost:3000', // Local development
                            'https://*.daiwanmaru.com', // Production (replace with your domain)
                            '*' // For testing purposes, you can use '*' but strict origin is better
                        ],
                        ExposeHeaders: ['ETag'],
                        MaxAgeSeconds: 3600,
                    },
                ],
            },
        }));
        console.log('✅ CORS configuration updated successfully!');
    } catch (error: any) {
        console.error('❌ Failed to set CORS:', error.name);
        console.error('Message:', error.message);
        console.error('Bucket:', bucketName);
        console.error('Endpoint:', process.env.S3_ENDPOINT);
        console.error('Region:', process.env.S3_REGION);
        // console.error(JSON.stringify(error, null, 2));
    }
}

main();
