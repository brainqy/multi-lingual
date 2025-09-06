// src/lib/db.edge.ts
import { PrismaClient } from '@prisma/client';

// This is a separate Prisma Client instance specifically for the Edge runtime.
// By importing from '@prisma/client', Prisma's build process automatically provides
// the correct Edge-compatible client.
const prismaEdge = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

export const db = prismaEdge;
