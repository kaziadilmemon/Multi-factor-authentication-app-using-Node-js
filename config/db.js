const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:pakistan@715@localhost:5432/node_2fa",
});

module.exports = { prisma };
