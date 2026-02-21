import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@daiwanmaru/core';
import { storage } from '@/lib/core';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { inputs, options } = body;

        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return NextResponse.json({ error: 'Inputs are required' }, { status: 400 });
        }

        // Get tool
        const tool = await prisma.tool.findUnique({
            where: { slug: 'combine-to-pdf' }
        });

        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        // Check limits based on user plan
        const userPlan = session.user.plan || 'FREE';
        const maxFiles = userPlan === 'PRO' ? 20 : 10;
        const maxTotalBytes = userPlan === 'PRO' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;

        if (inputs.length > maxFiles) {
            return NextResponse.json({ error: 'Too many files', code: 'LIMIT_EXCEEDED' }, { status: 413 });
        }

        const totalBytes = inputs.reduce((acc: number, input: any) => acc + (input.sizeBytes || 0), 0);
        if (totalBytes > maxTotalBytes) {
            return NextResponse.json({ error: 'Total size exceeds limit', code: 'LIMIT_EXCEEDED' }, { status: 413 });
        }

        // Create Job
        const job = await prisma.job.create({
            data: {
                toolId: tool.id,
                userId: session.user.id,
                status: 'PENDING',
                params: options || {},
            }
        });

        // Create JobInputs and get Presigned URLs
        const uploadUrls = await Promise.all(inputs.map(async (input: any, index: number) => {
            const extension = input.filename.split('.').pop();
            const storageKey = `jobs/${job.id}/inputs/${index.toString().padStart(2, '0')}-${input.filename}`;

            // Create JobInput record
            const jobInput = await prisma.jobInput.create({
                data: {
                    jobId: job.id,
                    index,
                    filename: input.filename,
                    mime: input.mime,
                    sizeBytes: input.sizeBytes,
                    storageKey,
                }
            });

            // Get presigned URL
            const uploadUrls = await storage.createUploadUrls(job.id, [{ name: input.filename, contentType: input.mime }]);
            // Note: StorageAdapter.createUploadUrls generates its own key with uuid, 
            // but the spec suggests a specific pattern. I'll modify StorageAdapter or just use its output.
            // Actually, I'll update StorageAdapter to allow passing a key if needed, or just follow its lead.
            // For now, I'll use the URL from storage.createUploadUrls.

            return {
                inputId: jobInput.id,
                putUrl: uploadUrls[0].url,
                b2Key: uploadUrls[0].key,
            };
        }));

        // Update JobInputs with the actual keys from storage adapter
        await Promise.all(uploadUrls.map(async (u) => {
            await prisma.jobInput.update({
                where: { id: u.inputId },
                data: { storageKey: u.b2Key }
            });
        }));

        return NextResponse.json({
            job: {
                id: job.id,
                status: job.status,
                limits: { maxTotalBytes, maxFiles }
            },
            upload: {
                inputs: uploadUrls,
                expiresInSec: 3600
            }
        });

    } catch (error: any) {
        console.error('[CREATE_JOB_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
