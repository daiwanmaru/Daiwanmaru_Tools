import { prisma } from './db/index.js';

export async function getAllTools() {
    const tools = await prisma.tool.findMany();
    return tools.map(tool => ({
        ...tool,
        paramsDefine: tool.paramsDefine ? JSON.parse(tool.paramsDefine as string) : null,
    }));
}

export async function getToolBySlug(slug: string) {
    const tool = await prisma.tool.findUnique({
        where: { slug },
    });
    if (!tool) return null;
    return {
        ...tool,
        paramsDefine: tool.paramsDefine ? JSON.parse(tool.paramsDefine as string) : null,
    };
}
