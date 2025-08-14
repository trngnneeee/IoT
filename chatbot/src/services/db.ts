import { MongoClient, Db } from "mongodb";

let _db: Db | null = null;

export async function getDB(): Promise<Db> {
  if (_db) return _db;
  const url = process.env.MONGO_URL;
  const name = process.env.DB_NAME || "garbage_ai";
  if (!url) throw new Error("MONGO_URL missing in .env");
  const client = new MongoClient(url);
  await client.connect();
  _db = client.db(name);
  console.log("[Mongo] connected:", name);
  return _db;
}
