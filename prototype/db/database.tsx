import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("amis.db");

export const escapeSql = (value: string) =>
  String(value).replace(/'/g, "''");

export const initDB = async () => {
  try {
    // USERS
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        phone TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT
      );
    `);

    // DISTRICTS
    db.execSync(`
      CREATE TABLE IF NOT EXISTS districts (
        id INTEGER PRIMARY KEY,
        name TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    // MARKETS
    db.execSync(`
      CREATE TABLE IF NOT EXISTS markets (
        id INTEGER PRIMARY KEY,
        district_id INTEGER,
        name TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    // CATEGORIES
    db.execSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    // ITEMS
    db.execSync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY,
        category_id INTEGER,
        name TEXT,
        synced INTEGER DEFAULT 1
      );
    `);

    // MARKET FORMS (FIXED)
    db.execSync(`
      CREATE TABLE IF NOT EXISTS market_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  category TEXT,
  district TEXT,
  market TEXT,
  data TEXT,
  synced INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  last_synced_at TEXT,
  created_at TEXT
);
    `);

    // MARKET RATES
    db.execSync(`
      CREATE TABLE IF NOT EXISTS market_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop TEXT,
        price TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT
      );
    `);

    console.log("✅ DB FIXED & INITIALIZED");
  } catch (error) {
    console.log("❌ DB ERROR:", error);
  }
};