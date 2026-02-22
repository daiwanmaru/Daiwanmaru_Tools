import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany({ select: { name: true } });
    tools.forEach(t => console.log(t.name));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
