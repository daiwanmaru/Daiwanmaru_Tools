#!/usr/bin/env node

/**
 * Vercel 資料庫初始化腳本
 * 
 * 這個腳本會：
 * 1. 執行 Prisma migrations
 * 2. 執行資料庫 seed
 * 
 * 使用方式：
 * pnpm run setup:db
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const coreDir = join(__dirname, '..');

console.log('🚀 Starting database setup...\n');

try {
    // 1. Push schema to database
    console.log('📊 Pushing Prisma schema to database...');
    execSync('prisma db push', {
        cwd: coreDir,
        stdio: 'inherit',
        env: { ...process.env }
    });
    console.log('✅ Schema pushed successfully\n');

    // 2. Seed database
    console.log('🌱 Seeding database...');
    execSync('prisma db seed', {
        cwd: coreDir,
        stdio: 'inherit',
        env: { ...process.env }
    });
    console.log('✅ Database seeded successfully\n');

    console.log('🎉 Database setup completed!');
} catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
}
