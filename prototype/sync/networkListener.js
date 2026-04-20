import NetInfo from "@react-native-community/netinfo";
import { syncForms } from "./syncForms";

export const initNetworkListener = () => {
  NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log("📶 Internet back - syncing...");
      syncForms();
    }
  });
};