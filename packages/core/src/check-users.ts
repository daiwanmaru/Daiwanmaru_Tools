import { prisma } from './db/index.js';
async function run() {
    const users = await prisma.user.findMany({
        include: {
            password: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}
run().catch(console.error);
