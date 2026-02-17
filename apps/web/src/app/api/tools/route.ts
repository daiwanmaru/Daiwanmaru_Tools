import { NextResponse } from 'next/server';
import { prisma } from '@daiwanmaru/core';

export async function GET() {
    try {
        const tools = await prisma.tool.findMany();
        return NextResponse.json(tools);
    } catch (error) {
        console.error('Failed to fetch tools:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch tools',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}
