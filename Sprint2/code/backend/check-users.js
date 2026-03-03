require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    // Check driver01 exists
    const driver = await prisma.user.findUnique({ where: { username: 'driver01' } });
    if (!driver) {
        console.log('❌ driver01 NOT FOUND');
        return;
    }
    console.log('✅ driver01 found:', { id: driver.id, email: driver.email, role: driver.role, isActive: driver.isActive });

    // Test password
    const match = await bcrypt.compare('12345678', driver.password);
    console.log('🔑 Password match:', match);

    // Check user01 
    const user = await prisma.user.findUnique({ where: { username: 'user01' } });
    if (!user) {
        console.log('❌ user01 NOT FOUND');
        return;
    }
    console.log('✅ user01 found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });

    const match2 = await bcrypt.compare('12345678', user.password);
    console.log('🔑 Password match:', match2);

    // Check admin
    const admin = await prisma.user.findUnique({ where: { username: 'pooh01' } });
    if (!admin) {
        console.log('❌ pooh01 NOT FOUND');
        return;
    }
    console.log('✅ pooh01 found:', { id: admin.id, email: admin.email, role: admin.role, isActive: admin.isActive });
}

main().catch(console.error).finally(() => prisma.$disconnect());
