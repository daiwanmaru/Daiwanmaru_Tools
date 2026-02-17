import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';
import { ratelimit, storage } from '@/lib/core';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { toolId, params, files } = body;

        if (!Array.isArray(files)) {
            return NextResponse.json({ error: 'files must be an array' }, { status: 400 });
        }

        // 1. Rate Limit
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        try {
            const { success } = await ratelimit.check(ip);
            if (!success) {
                return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
            }
        } catch (e: any) {
            console.warn('[API] Rate limit check skipped:', e.message);
        }

        // 2. Generate Job ID & Upload URLs 
        const jobId = uuidv4();

        let uploadUrls;
        try {
            const fileMeta = files.map(f => ({
                name: String(f.name),
                contentType: String(f.contentType || 'application/octet-stream')
            }));
            uploadUrls = await storage.createUploadUrls(jobId, fileMeta);
        } catch (storageErr: any) {
            console.error('[API] Storage error:', storageErr);
            throw storageErr;
        }

        // 3. Create Job in DB
        let userId = null;
        try {
            const session = await auth();
            userId = session?.user?.id || null;
        } catch (authErr: any) {
            console.warn('[API] Auth check failed:', authErr.message);
        }

        try {
            const job = await prisma.job.create({
                data: {
                    id: jobId,
                    toolId,
                    userId: userId,
                    status: 'PENDING',
                    params: params || {},
                    // @ts-ignore
                    jobInputs: {
                        create: uploadUrls.map((u, index) => {
                            const originalFile = files.find(f => String(f.name) === String(u.name));
                            return {
                                index,
                                filename: u.name,
                                mime: originalFile?.contentType || 'application/octet-stream',
                                sizeBytes: 0,
                                storageKey: u.key,
                            };
                        })
                    }
                },
            });
            console.log(`[API] Job created: ${job.id}`);
        } catch (dbErr: any) {
            console.error('[API] Database error:', dbErr);
            throw dbErr;
        }

        return NextResponse.json({ jobId, uploadUrls });

    } catch (e: any) {
        console.error('[API] Global Error:', e);
        return NextResponse.json(
            {
                error: e.message || 'Internal Server Error',
                stack: process.env.NODE_ENV === 'development' ? e.stack : undefined,
            },
            { status: 500 }
        );
    }
}
