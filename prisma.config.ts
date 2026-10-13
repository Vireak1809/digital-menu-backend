import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

const envPath = path.resolve(process.cwd(), path.basename(process.cwd()) === "server" ? "../.env" : ".env");
dotenv.config({ path: envPath });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
});