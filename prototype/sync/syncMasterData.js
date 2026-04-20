import { db } from "../db/database";

export const syncMasterData = async () => {
  try {
    const res = await fetch("http://172.16.13.232/backend/api/get-all.php");
    const data = await res.json();

    console.log("SYNC DATA:", data);

    // DISTRICTS
    data.districts.forEach((d) => {
      db.execSync(`
        INSERT OR IGNORE INTO districts (id, name, synced)
        VALUES (${d.id}, '${d.name}', 1);
      `);
    });

    // MARKETS
    data.markets.forEach((m) => {
      db.execSync(`
        INSERT OR IGNORE INTO markets (id, district_id, name, synced)
        VALUES (${m.id}, ${m.district_id}, '${m.name}', 1);
      `);
    });

    // CATEGORIES
    data.categories.forEach((c) => {
      db.execSync(`
        INSERT OR IGNORE INTO categories (id, name, synced)
        VALUES (${c.id}, '${c.name}', 1);
      `);
    });

    // ITEMS
    data.items.forEach((i) => {
      db.execSync(`
        INSERT OR IGNORE INTO items (id, category_id, name, synced)
        VALUES (${i.id}, ${i.category_id}, '${i.name}', 1);
      `);
    });

    console.log("MASTER DATA SYNC COMPLETE");
  } catch (error) {
    console.log("SYNC ERROR:", error);
  }
};