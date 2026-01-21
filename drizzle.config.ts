import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema.ts', // 指向我們剛剛建的 schema
  out: './drizzle',
  dialect: 'sqlite', // 我們用 SQLite
  dbCredentials: {
    url: 'course.db', // 資料庫檔案會產生在這裡
  },
});