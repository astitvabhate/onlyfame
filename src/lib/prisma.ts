import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

if (!process.env.DATABASE_URL) {
    const envPaths = ['.env.local', '.env'].map((file) => path.join(process.cwd(), file));

    for (const envPath of envPaths) {
        if (!fs.existsSync(envPath)) continue;

        const contents = fs.readFileSync(envPath, 'utf8');
        for (const rawLine of contents.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#') || !line.includes('=')) continue;

            const separatorIndex = line.indexOf('=');
            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();

            if (!process.env[key]) {
                process.env[key] = value;
            }
        }

        if (process.env.DATABASE_URL) break;
    }
}

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
