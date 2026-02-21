import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@daiwanmaru/core';
import { storage } from '@/lib/core';

export async function POST(req: Request, { params }: { params: { jobId: string } }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId, userId: session.user.id },
            // @ts-ignore
            include: { jobOutput: true }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // @ts-ignore
        if (job.status !== 'COMPLETED' || !job.jobOutput) {
            return NextResponse.json({ error: 'Job not ready', code: 'JOB_NOT_READY' }, { status: 409 });
        }

        // Generate Presigned URL for download
        // @ts-ignore
        const downloadUrls = await storage.createDownloadUrls(job.id, [{
            // @ts-ignore
            key: job.jobOutput.storageKey,
            // @ts-ignore
            name: job.jobOutput.filename
        }]);

        return NextResponse.json({
            downloadUrl: downloadUrls[0].url,
            expiresInSec: 3600,
            // @ts-ignore
            filename: job.jobOutput.filename
        });

    } catch (error: any) {
        console.error('[GET_DOWNLOAD_URL_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
