"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = getDB;
const mongodb_1 = require("mongodb");
let _db = null;
async function getDB() {
    if (_db)
        return _db;
    const url = process.env.MONGO_URL;
    const name = process.env.DB_NAME || "garbage_ai";
    if (!url)
        throw new Error("MONGO_URL missing in .env");
    const client = new mongodb_1.MongoClient(url);
    await client.connect();
    _db = client.db(name);
    console.log("[Mongo] connected:", name);
    return _db;
}
