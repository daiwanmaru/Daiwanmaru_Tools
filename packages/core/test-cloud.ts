import 'dotenv/config';
import { prisma, QueueAdapter, StorageAdapter } from './src/index.js';

async function test() {
    console.log('--- Testing Production Cloud Connections ---');

    try {
        // 1. Test Neon DB
        console.log('1. Connecting to Neon DB...');
        const toolsCount = await prisma.tool.count();
        const firstTool = await prisma.tool.findFirst();
        console.log(`✅ DB Success! Found ${toolsCount} tools. First tool: ${firstTool?.name}`);

        // 2. Test Upstash Redis
        console.log('2. Connecting to Upstash Redis...');
        const queue = new QueueAdapter({
            url: process.env.UPSTASH_REDIS_URL || '',
            token: process.env.UPSTASH_REDIS_TOKEN || '',
        });
        await queue.enqueue('test-connection-job');
        const dequeued = await queue.dequeue();
        console.log(`✅ Redis Success! Enqueued and dequeued test job: ${dequeued}`);

        // 3. Test Backblaze B2 (Signer)
        console.log('3. Testing Backblaze B2 Signer...');
        const storage = new StorageAdapter({
            endpoint: process.env.S3_ENDPOINT || '',
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            bucket: process.env.S3_BUCKET || '',
            region: process.env.S3_REGION || 'us-east-1',
        });
        const urls = await storage.createUploadUrls('test', [{ name: 'test.pdf', contentType: 'application/pdf' }]);
        console.log(`✅ B2 Success! Generated presigned URL for key: ${urls[0].key}`);

    } catch (error) {
        console.error('❌ Connection Failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

test();
