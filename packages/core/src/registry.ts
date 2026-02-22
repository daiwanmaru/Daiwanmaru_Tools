import { prisma } from './db/index.js';

export async function getAllTools() {
    const tools = await prisma.tool.findMany();
    return tools;
}

export async function getToolBySlug(slug: string) {
    const tool = await prisma.tool.findUnique({
        where: { slug },
    });
    return tool;
}
