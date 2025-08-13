const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    }
    return result;
  });
}

prisma.$on('query', (e) => {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

module.exports = prisma;
