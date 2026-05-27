import path from "node:path";
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

// Конфигурация Prisma CLI (миграции, генерация). В Prisma 7 строка
// подключения к БД вынесена из schema.prisma в этот файл.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
});
