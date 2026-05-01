import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __ledoPrisma: PrismaClient | undefined
}

export const prisma =
  global.__ledoPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__ledoPrisma = prisma
}
