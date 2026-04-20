import NetInfo from "@react-native-community/netinfo";
import { db } from "../db/database";

export const syncOfflineUsers = async () => {
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      console.log("📴 User sync skipped - offline");
      return;
    }

    const users = db.getAllSync(`
      SELECT * FROM users WHERE synced = 0;
    `);

    if (!users.length) {
      console.log("No users to sync");
      return;
    }

    console.log("Syncing users:", users.length);

    for (const user of users) {
      try {
        const payload = {
          name: user.name,
          email: user.email,
          password: user.password,
          phone: user.phone,
        };

        const res = await fetch(
          "http://172.16.13.232/backend/api/register.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Invalid response for user:", user.email);
          continue;
        }

        if (data.status === "success" || data.status === "exists") {
          db.execSync(`
            UPDATE users 
            SET synced = 1 
            WHERE id = ${user.id};
          `);

          console.log("USER SYNCED:", user.email);
        }
      } catch (err) {
        console.log("User sync error:", err);
      }
    }

    console.log("SYNC COMPLETE");
  } catch (err) {
    console.log("SYNC FAILED:", err);
  }
};