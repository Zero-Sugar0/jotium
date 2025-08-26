import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
export const db = drizzle(client);
