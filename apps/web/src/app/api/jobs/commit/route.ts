import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { queue } from '@/lib/core';

export async function POST(req: Request) {
    const { jobId } = await req.json();

    // 1. Update status to QUEUED
    await prisma.job.update({
        where: { id: jobId },
        data: { status: 'QUEUED' },
    });

    // 2. Enqueue for worker
    await queue.enqueue(jobId);

    return NextResponse.json({ success: true });
}
