import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
    prisma,
    QueueAdapter,
    StorageAdapter,
} from '@daiwanmaru/core';

// Import Processors
import * as PDFMerge from './processors/pdf-merge/index.js';
import * as CombineToPDF from './processors/combine-to-pdf/index.js';
import * as MarkdownConverter from './processors/markdown-converter/index.js';

// Initialize Adapters
const queue = new QueueAdapter({
    url: process.env.UPSTASH_REDIS_URL || '',
    token: process.env.UPSTASH_REDIS_TOKEN || '',
});

const storage = new StorageAdapter({
    endpoint: process.env.S3_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || 'us-east-1',
});

// Map of available processors
const processors: Record<string, any> = {
    'pdf-merge': PDFMerge,
    'combine-to-pdf': CombineToPDF,
    'markdown-converter': MarkdownConverter,
};

async function downloadFile(key: string, localPath: string) {
    try {
        const buffer = await storage.downloadFile(key);
        await fs.writeFile(localPath, buffer);
    } catch (error) {
        console.error(`[Worker] Failed to download ${key}:`, error);
        throw error;
    }
}

async function uploadFile(key: string, localPath: string) {
    try {
        const buffer = await fs.readFile(localPath);
        // Detect content type if possible, or leave undefined
        await storage.uploadFile(key, buffer);
    } catch (error) {
        console.error(`[Worker] Failed to upload ${key}:`, error);
        throw error;
    }
}

async function processJob(jobId: string) {
    console.log(`[Worker] Processing Job: ${jobId}`);
    const workingDir = path.join(os.tmpdir(), `job-${jobId}`);

    try {
        await fs.mkdir(workingDir, { recursive: true });

        // 1. Fetch Job
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                // @ts-ignore
                tool: true,
                // @ts-ignore
                jobInputs: {
                    orderBy: { index: 'asc' }
                }
            }
        });

        if (!job) throw new Error(`Job ${jobId} not found`);

        // 2. Update Status
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', progress: 10 }
        });

        // @ts-ignore
        const processor = processors[job.tool.slug];
        // @ts-ignore
        if (!processor) throw new Error(`No processor for tool ${job.tool.slug}`);

        // 3. Download Inputs
        // @ts-ignore
        const inputFiles = job.jobInputs;
        const localInputPaths: string[] = [];

        for (const input of inputFiles) {
            // Sanitize filename to prevent directory traversal
            const safeName = `${input.index}-${path.basename(input.filename)}`;
            const localPath = path.join(workingDir, safeName);
            console.log(`[Worker] Downloading ${input.storageKey} to ${localPath}...`);

            await downloadFile(input.storageKey, localPath);
            localInputPaths.push(localPath);
        }

        await prisma.job.update({
            where: { id: jobId },
            data: { progress: 40 }
        });

        // 4. Execution
        // @ts-ignore
        console.log(`[Worker] Executing ${job.tool.slug}...`);

        const result = await processor.process({
            jobId,
            // @ts-ignore
            params: (job.params as any) || {},
            inputFiles: localInputPaths,
            workingDir
        });

        await prisma.job.update({
            where: { id: jobId },
            data: { progress: 80 }
        });

        // 5. Upload Outputs
        console.log(`[Worker] Uploading ${result.outputs.length} outputs...`);

        for (const output of result.outputs) {
            const outputKey = output.key;
            const outputLocalPath = path.join(workingDir, output.name);

            // Check if file exists
            try {
                await fs.access(outputLocalPath);
            } catch {
                throw new Error(`Output file ${output.name} not found at ${outputLocalPath}`);
            }

            console.log(`[Worker] Uploading ${outputLocalPath} to ${outputKey}...`);
            await uploadFile(outputKey, outputLocalPath);
        }

        // 6. Record Output in DB and Complete
        const finalOutput = result.outputs[0];

        // Get file size
        const stats = await fs.stat(path.join(workingDir, finalOutput.name));

        // @ts-ignore
        await prisma.jobOutput.create({
            data: {
                jobId: jobId,
                filename: finalOutput.name,
                mime: finalOutput.mime || 'application/octet-stream',
                sizeBytes: stats.size,
                storageKey: finalOutput.key,
            }
        });

        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                progress: 100,
            }
        });

        console.log(`[Worker] Job ${jobId} finished successfully`);

    } catch (error: any) {
        console.error(`[Worker] Job ${jobId} error:`, error);
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage: error.message || 'Unknown error',
                progress: 0
            }
        });
    } finally {
        // Cleanup
        try {
            await fs.rm(workingDir, { recursive: true, force: true });
        } catch (e) {
            console.warn(`[Worker] Failed to cleanup ${workingDir}`, e);
        }
    }
}

async function start() {
    console.log('[Worker] Polling for jobs...');
    while (true) {
        try {
            const jobId = await queue.dequeue();
            if (jobId) {
                await processJob(jobId);
            } else {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.error('[Worker] Poll error:', e);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

start();
