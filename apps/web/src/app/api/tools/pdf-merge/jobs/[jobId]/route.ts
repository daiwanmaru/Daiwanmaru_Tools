import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@daiwanmaru/core';

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;

    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId, userId: session.user.id },
            include: {
                // @ts-ignore
                jobInputs: {
                    orderBy: { index: 'asc' }
                },
                // @ts-ignore
                jobOutput: true
            }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                errorCode: job.errorCode,
                errorMessage: job.errorMessage,
            },
            inputs: job.jobInputs,
            output: job.jobOutput
        });

    } catch (error: any) {
        console.error('[GET_JOB_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
