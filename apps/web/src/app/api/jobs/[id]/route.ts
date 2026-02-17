import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { storage } from '@/lib/core';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;

  console.log(`[API] Fetching job status for ID: ${id}`);

  const job = await prisma.job.findUnique({
    where: { id: id },
    include: {
      // @ts-ignore
      jobOutput: true
    }
  });

  if (!job) {
    console.warn(`[API] Job not found: ${id}`);
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  console.log(`[API] Job found, status: ${job.status}`);
  // @ts-ignore
  if (job.status === 'COMPLETED' && job.jobOutput) {
    // @ts-ignore
    const output = job.jobOutput;

    // Generate download URL for output
    const downloadUrl = await storage.createDownloadUrl(output.storageKey, output.filename);

    return NextResponse.json({
      ...job,
      downloadUrl: downloadUrl
    });
  }

  return NextResponse.json(job);
}
