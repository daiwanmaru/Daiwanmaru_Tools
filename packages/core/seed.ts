import { prisma } from './src/db/index.js';

async function main() {
    console.log('Seeding tools...');

    // 1. Cleanup old or redundant tools
    console.log('Cleaning up old tools...');
    await prisma.tool.deleteMany({
        where: {
            slug: {
                in: ['combine-to-pdf', 'pdf-combine']
            }
        }
    });

    const tools = [
        {
            slug: 'pdf-merge',
            name: 'PDF Merge & 合併 PDF',
            description: 'Merge multiple PDF and image files into a single document.',
            category: 'DOC',
            paramsDefine: {
                fields: [
                    {
                        name: 'pageSize',
                        label: 'Page Size',
                        type: 'select',
                        options: [
                            { label: 'A4', value: 'A4' },
                            { label: 'Original', value: 'original' },
                        ],
                        default: 'A4',
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
        {
            slug: 'markdown-converter',
            name: 'Markdown 轉換器',
            description: '將 DOCX, PDF, HTML 或 TXT 檔案轉換為 Markdown 格式。',
            category: 'DOC',
            paramsDefine: {
                fields: [
                    {
                        name: 'extractImages',
                        label: '提取圖片',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'frontMatter',
                        label: '包含 Front Matter',
                        type: 'boolean',
                        default: true,
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

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        // @ts-ignore
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
