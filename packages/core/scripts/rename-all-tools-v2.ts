import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany();

    for (const tool of tools) {
        let newName = tool.name;

        // 1. Remove "Daiwanmaru " prefix if exists
        newName = newName.replace(/^Daiwanmaru\s+/i, '');

        // 2. Specific translations and [Noun] + [Verb+er] logic
        if (tool.slug === 'markdown-converter') newName = 'Markdown Converter';
        if (tool.slug === 'pdf-merge') newName = 'PDF Merger';
        if (tool.slug === 'image-resize') newName = 'Image Resizer';
        if (tool.slug === 'pdf-compress') newName = 'PDF Compressor';
        if (tool.slug.includes('pdf') && tool.name.includes('轉換器')) newName = 'PDF Converter';

        // Generic [Noun] [Verb]er cleanup
        // (Just to be safe, manually mapping is better here for accuracy)
        const manualMap: Record<string, string> = {
            'pdf-merge': 'PDF Merger',
            'pdf-compress': 'PDF Compressor',
            'image-resize': 'Image Resizer',
            'markdown-converter': 'Markdown Converter'
        };

        if (manualMap[tool.slug]) {
            newName = manualMap[tool.slug];
        }

        console.log(`Updating ${tool.slug}: "${tool.name}" -> "${newName}"`);

        await prisma.tool.update({
            where: { id: tool.id },
            data: { name: newName }
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
