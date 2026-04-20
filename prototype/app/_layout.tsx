import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem("user");

      const inAuthGroup =
        segments[0] === "login" || segments[0] === "register";

      if (!user && !inAuthGroup) {
        router.replace("/login");
      }

      if (user && inAuthGroup) {
        router.replace("/(tabs)/home");
      }

      setLoading(false);
    };

    checkSession();
  }, [segments]);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}