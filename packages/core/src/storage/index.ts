import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface StorageConfig {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    region?: string;
}

export class StorageAdapter {
    private client: S3Client;
    private bucket: string;

    constructor(config: StorageConfig) {
        this.client = new S3Client({
            region: config.region || 'auto',
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
        this.bucket = config.bucket;
    }

    async createUploadUrls(jobId: string, files: { name: string, contentType: string }[]) {
        return Promise.all(
            files.map(async (file) => {
                const key = `input/${jobId}/${uuidv4()}-${file.name}`;
                const command = new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    ContentType: file.contentType,
                });
                const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
                return { key, url, name: file.name };
            })
        );
    }

    async createDownloadUrls(jobId: string, outputs: { key: string, name: string }[]) {
        return Promise.all(
            outputs.map(async (output) => {
                const command = new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: output.key,
                });
                const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
                return { key: output.key, url, name: output.name };
            })
        );
    }

    async downloadFile(key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.client.send(command);
        if (!response.Body) {
            throw new Error(`File ${key} not found or empty`);
        }

        // Handle stream correctly for Node.js
        const stream = response.Body as unknown as AsyncIterable<Uint8Array>;
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async uploadFile(key: string, body: Buffer | Uint8Array, contentType?: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        });
        await this.client.send(command);
    }
}
