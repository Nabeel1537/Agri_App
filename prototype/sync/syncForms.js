import NetInfo from "@react-native-community/netinfo";
import { db } from "../db/database";

const API_URL = "http://172.16.13.232/backend/api/submit-form.php";

const MAX_RETRY = 5;

export const syncForms = async () => {
  try {
    const net = await NetInfo.fetch();

    if (!net.isConnected) {
      console.log("📴 Offline - sync skipped");
      return;
    }

    const forms = db.getAllSync(`
      SELECT * FROM market_forms
      WHERE synced = 0 AND retry_count < ${MAX_RETRY}
    `);

    console.log("📦 PENDING FORMS:", forms.length);

    for (const form of forms) {
      try {
        const payload = {
          date: form.date,
          category: form.category,
          district: form.district,
          market: form.market,
          data: JSON.parse(form.data),
        };

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        if (!res.ok) {
          console.log("❌ SERVER ERROR", res.status, text);
          throw new Error(`HTTP ${res.status}`);
        }

        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.log("❌ INVALID JSON RESPONSE", text);
          throw new Error("Invalid JSON");
        }

        if (json && String(json.status).toLowerCase() === "success") {
          db.execSync(`
            UPDATE market_forms
            SET synced = 1,
                last_synced_at = datetime('now')
            WHERE id = ${form.id};
          `);

          console.log("✅ SYNCED:", form.id);
        } else {
          throw new Error("Server rejected");
        }

      } catch (err) {
        console.log("❌ SYNC FAILED FOR ID:", form.id);

        db.execSync(`
          UPDATE market_forms
          SET retry_count = retry_count + 1
          WHERE id = ${form.id};
        `);
      }
    }
  } catch (e) {
    console.log("❌ SYNC SYSTEM FAILED:", e);
  }
};