import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany({
        select: {
            id: true,
            name: true,
            slug: true
        }
    });
    console.log(tools);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
