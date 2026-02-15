import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { storage } from '@/lib/core';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;

  const job = await prisma.job.findUnique({
    where: { id: id },
  });

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (job.status === 'COMPLETED' && job.outputs) {
    const outputs = job.outputs as unknown as Array<{ key: string; name: string }>;

    // Generate download URLs for outputs
    const downloadUrls = await storage.createDownloadUrls(id, outputs);

    return NextResponse.json({
      ...job,
      downloadUrls: downloadUrls.map(u => ({ name: u.name, url: u.url }))
    });
  }

  return NextResponse.json(job);
}
