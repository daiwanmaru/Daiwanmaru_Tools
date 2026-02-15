import { NextResponse } from 'next/server';
import { storage } from '@/lib/core';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const uploadUrl = formData.get('uploadUrl') as string;
        const contentType = formData.get('contentType') as string;

        if (!file || !uploadUrl) {
            return NextResponse.json({ error: 'Missing file or uploadUrl' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: buffer,
            headers: {
                'Content-Type': contentType,
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('B2 Upload Failed:', errorText);
            return NextResponse.json({ error: 'B2 Upload Failed' }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Upload Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
