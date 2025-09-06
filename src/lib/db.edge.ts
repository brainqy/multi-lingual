// src/lib/db.edge.ts
import { PrismaClient } from '@prisma/client/edge';

// This is a separate Prisma Client instance specifically for the Edge runtime.
const prismaEdge = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

export const db = prismaEdge;
