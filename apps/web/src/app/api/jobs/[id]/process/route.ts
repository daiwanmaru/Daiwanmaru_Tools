import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { queue } from '@/lib/core';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    try {
        const id = params.id;
        if (!id) throw new Error('Job ID missing');

        const job = await prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Job already processing or completed',
                status: job.status
            }, { status: 400 });
        }

        // Update status to QUEUED
        await prisma.job.update({
            where: { id },
            data: { status: 'QUEUED' },
        });

        // Enqueue
        await queue.enqueue(id);

        return NextResponse.json({ success: true, status: 'QUEUED' });

    } catch (e: any) {
        console.error('Job Queue Error:', e);
        return NextResponse.json({ error: e.message || 'Error queuing job' }, { status: 500 });
    }
}
