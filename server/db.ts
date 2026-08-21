import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

function createDatabase(databaseUrl: string) {
  return drizzle(mysql.createPool(databaseUrl), { schema, mode: "default" });
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  if (database) return database;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for scholar record operations.");

  database = createDatabase(databaseUrl);
  return database;
}
