import { prisma } from './src/db/index.js';

async function main() {
    console.log('Seeding tools...');

    const tools = [
        {
            slug: 'pdf-merge',
            name: 'PDF Merge',
            description: 'Merge multiple PDF files into one.',
            category: 'DOC',
            paramsDefine: {
                fields: [
                    {
                        name: 'outputName',
                        label: 'Output Filename',
                        type: 'string',
                        default: 'merged.pdf',
                        required: true,
                    },
                ],
            },
        },
        {
            slug: 'pdf-compress',
            name: 'PDF Compress',
            description: 'Reduce the file size of your PDF.',
            category: 'DOC',
            paramsDefine: {
                fields: [
                    {
                        name: 'quality',
                        label: 'Compression Quality',
                        type: 'select',
                        options: [
                            { label: 'High (Smallest file)', value: 'high' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Low (Best quality)', value: 'low' },
                        ],
                        default: 'medium',
                    },
                ],
            },
        },
        {
            slug: 'image-resize',
            name: 'Image Resize',
            description: 'Resize your images to specific dimensions.',
            category: 'IMAGE',
            paramsDefine: {
                fields: [
                    {
                        name: 'width',
                        label: 'Width (px)',
                        type: 'number',
                        required: true,
                    },
                    {
                        name: 'height',
                        label: 'Height (px)',
                        type: 'number',
                        required: true,
                    },
                ],
            },
        },
    ];

    for (const tool of tools) {
        await prisma.tool.upsert({
            where: { slug: tool.slug },
            update: tool,
            create: tool,
        });
    }

    console.log('Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
