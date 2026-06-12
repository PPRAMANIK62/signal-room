export const apiEnv = {
  port: Number(process.env.API_PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
};
