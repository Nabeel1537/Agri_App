import { db } from "../db/database";

export const syncRates = async (onDone) => {
  try {
    const rates = db.getAllSync(`
      SELECT * FROM market_rates 
      WHERE synced = 0 OR synced IS NULL;
    `);

    if (!rates.length) {
      console.log("No rates to sync");
      if (onDone) onDone(); // 🔥 IMPORTANT
      return;
    }

    console.log("Syncing rates:", rates.length);

    for (const rate of rates) {
      try {
        console.log("SYNCING:", rate.crop);

        const res = await fetch(
          "http://172.16.13.232/backend/api/submit-rates.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              crop: rate.crop,
              price: rate.price,
            }),
          }
        );

        const text = await res.text();
        console.log("RAW RESPONSE:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Invalid JSON response");
          continue;
        }

        if (data.status === "success") {
          db.execSync(`
            UPDATE market_rates 
            SET synced = 1 
            WHERE id = ${rate.id};
          `);

          console.log("SYNCED:", rate.crop);
        }
      } catch (err) {
        console.log("SYNC ERROR:", err);
      }
    }

    console.log("RATES SYNC COMPLETE");

    if (onDone) onDone(); // 🔥 THIS FIXES YOUR UI ISSUE
  } catch (error) {
    console.log("SYNC FAILED:", error);
    if (onDone) onDone(); // 🔥 ensure UI still refreshes
  }
};