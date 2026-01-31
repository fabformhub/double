import Database from "better-sqlite3";

const db = new Database("app.sqlite");

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

export default db;

