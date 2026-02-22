import { prisma } from '../src/db/index.js';

async function main() {
    const mappings: Record<string, string> = {
        'markdown-converter': 'Daiwanmaru Markdown Converter',
        'pdf-merge': 'Daiwanmaru PDF Merge',
        'image-resize': 'Daiwanmaru Image Resize'
    };

    for (const [slug, newName] of Object.entries(mappings)) {
        console.log(`Updating ${slug} -> ${newName}`);
        await prisma.tool.update({
            where: { slug },
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
