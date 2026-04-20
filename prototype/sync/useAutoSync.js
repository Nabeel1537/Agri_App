import NetInfo from "@react-native-community/netinfo";
import { syncForms } from "./syncForms";

let interval;

export const startAutoSync = () => {
  console.log("🔄 AUTO SYNC STARTED");

  const run = async () => {
    const state = await NetInfo.fetch();

    if (state.isConnected) {
      console.log("🌐 SYNC TRIGGERED");
      await syncForms();
    } else {
      console.log("📴 OFFLINE");
    }
  };

  run();

  interval = setInterval(run, 10000);

  return () => {
    if (interval) clearInterval(interval);
  };
};