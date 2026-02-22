import { prisma } from '../src/db/index.js';

async function main() {
    const tools = await prisma.tool.findMany();

    for (const tool of tools) {
        let newName = tool.name;
        if (!newName.startsWith('Daiwanmaru ')) {
            newName = `Daiwanmaru ${newName}`;
        }

        console.log(`Updating ${tool.name} -> ${newName}`);

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
