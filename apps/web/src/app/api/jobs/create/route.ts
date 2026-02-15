import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { ratelimit, storage } from '@/lib/core';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { toolId, params, files } = body;

        // 1. Rate Limit
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        try {
            const { success } = await ratelimit.check(ip);
            if (!success) {
                return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
            }
        } catch (e) {
            console.warn('Rate limit check failed, proceeding anyway:', e);
        }

        // 2. Generate Job ID & Upload URLs first (so we have keys)
        const jobId = uuidv4();

        // files is { name, contentType }[]
        // uploadUrls will be { name, key, url }[]
        const uploadUrls = await storage.createUploadUrls(jobId, files);

        // 3. Create Job in DB with keys
        const inputsWithKeys = uploadUrls.map(u => ({
            name: u.name,
            key: u.key,
            contentType: files.find((f: any) => f.name === u.name)?.contentType
        }));

        const job = await prisma.job.create({
            data: {
                id: jobId,
                toolId,
                status: 'PENDING',
                params,
                inputs: inputsWithKeys as any,
            },
        });

        return NextResponse.json({ jobId, uploadUrls });

    } catch (e: any) {
        console.error('[API] Create Job Error:', e);
        return NextResponse.json(
            { error: e.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
