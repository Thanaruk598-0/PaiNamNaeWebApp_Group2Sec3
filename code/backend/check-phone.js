require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const updated = await p.user.update({
        where: { email: process.env.ADMIN_EMAIL || 'pooh@gmail.com' },
        data: { phoneNumber: process.env.ADMIN_PHONE || '0812345678' },
        select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true }
    });
    console.log('✅ Updated admin phone:', JSON.stringify(updated, null, 2));
    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });