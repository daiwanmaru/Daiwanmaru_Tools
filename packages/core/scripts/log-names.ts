import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany();
    const names = tools.map(t => t.name).join(', ');
    console.log(`Current Tool Names: ${names}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
