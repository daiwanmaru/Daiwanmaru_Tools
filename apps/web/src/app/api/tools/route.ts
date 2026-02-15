import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';

export async function GET() {
    const tools = await prisma.tool.findMany();
    return NextResponse.json(tools);
}
