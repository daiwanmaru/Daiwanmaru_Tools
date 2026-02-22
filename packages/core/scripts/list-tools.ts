import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany();
    console.log(JSON.stringify(tools, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
