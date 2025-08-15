const { PrismaClient } = require('@prisma/client');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

const withPrisma = async (callback) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: ['error'],
    errorFormat: 'minimal',
  });

  try {
    const result = await callback(prisma);
    return result;
  } finally {
    await prisma.$disconnect();
  }
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    return await withPrisma(async (prisma) => {
      switch (event.httpMethod) {
        case 'GET':
          const favorites = await prisma.favoriteSeries.findMany({
            orderBy: { dateAdded: 'desc' }
          });
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(favorites),
          };

        case 'POST':
          const { publisher, series, volume = '' } = JSON.parse(event.body || '{}');
          const newFavorite = await prisma.favoriteSeries.create({
            data: { publisher, series, volume }
          });
          return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(newFavorite),
          };

        default:
          return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' }),
          };
      }
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
