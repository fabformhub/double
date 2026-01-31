import db from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema.sql
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

// Execute schema
db.exec(schema);

console.log("Database initialized successfully.");

