import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@daiwanmaru/core';
import { queue } from '@/lib/core';

export async function POST(req: Request, { params }: { params: { jobId: string } }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    try {
        const body = await req.json();
        const { inputs } = body; // Expected array of { inputId, etag, sizeBytes }

        const job = await prisma.job.findUnique({
            where: { id: jobId, userId: session.user.id },
            include: { jobInputs: true }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'PENDING') {
            return NextResponse.json({ job: { id: job.id, status: job.status } });
        }

        // Validate that all inputs have been finalized
        // In a real scenario, we might want to check S3 for actual existence, 
        // but here we rely on the client's confirmation for the MVP.
        if (inputs && Array.isArray(inputs)) {
            await Promise.all(inputs.map(async (input: any) => {
                await prisma.jobInput.update({
                    where: { id: input.inputId, jobId },
                    data: { etag: input.etag }
                });
            }));
        }

        // Update Job Status
        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: { status: 'QUEUED' }
        });

        // Enqueue
        await queue.enqueue(jobId);

        return NextResponse.json({
            job: {
                id: updatedJob.id,
                status: updatedJob.status
            }
        });

    } catch (error: any) {
        console.error('[FINALIZE_JOB_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
