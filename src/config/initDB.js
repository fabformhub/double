import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import db, { DB_PATH } from "./db.js"; // unified import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQL file paths
const schemaPath = path.join(__dirname, "schema.sql");
const seedCountriesPath = path.join(__dirname, "seed_countries.sql");
const seedLocationsPath = path.join(__dirname, "seed_locations.sql");
const seedCategoriesPath = path.join(__dirname, "seed_categories.sql");
const seedSubcategoriesPath = path.join(__dirname, "seed_subcategories.sql");

// Delete old DB
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Deleted old nookyup.db");
}

// Create new DB using the same path as the app
const fresh = new Database(DB_PATH);
console.log("Created new nookyup.db");

// Helper to run SQL files
function runSQL(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  fresh.exec(sql);
  console.log(`Executed: ${path.basename(filePath)}`);
}

// Run schema + seeds
runSQL(schemaPath);
runSQL(seedCountriesPath);      // <-- NEW
runSQL(seedLocationsPath);
runSQL(seedCategoriesPath);
runSQL(seedSubcategoriesPath);

console.log("Database initialized successfully.");
fresh.close();

