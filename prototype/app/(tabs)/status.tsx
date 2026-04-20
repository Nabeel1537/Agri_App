import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function Status() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* ---------------- USER LOAD ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");

      if (!data) {
        router.replace("/login");
        return;
      }

      setUser(JSON.parse(data));
    };

    loadUser();
  }, []);

  /* ---------------- HEADER ANIMATION ---------------- */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    const target = Date.now() + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const diff = target - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  };

  /* ---------------- CATEGORIES ---------------- */
  const categories: { name: string; icon: IconName }[] = [
    { name: "Vegetables", icon: "leaf" },
    { name: "Fruits", icon: "nutrition" },
    { name: "Meat", icon: "restaurant" },
    { name: "Grains", icon: "leaf-outline" },
    { name: "Dairy", icon: "water" },
    { name: "Poultry", icon: "egg" },
  ];

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.name}>Hello {user?.name || "User"} 👋</Text>
        <Text style={styles.sub}>Agriculture Status Panel</Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Auto Refresh</Text>
          <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Search categories..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        {/* QUICK STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>6</Text>
            <Text style={styles.statText}>Categories</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNum}>Live</Text>
            <Text style={styles.statText}>System</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNum}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statText}>Timer</Text>
          </View>
        </View>

        {/* GRID */}
        <Text style={styles.section}>Categories</Text>

        <View style={styles.grid}>
          {filtered.map((item, i) => (
            <TouchableOpacity key={i} style={styles.gridCard}>
              <Ionicons name={item.icon} size={26} color="#1b5e20" />
              <Text style={styles.gridText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4fbf4" },

  header: {
    backgroundColor: "#1b5e20",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  name: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  sub: { color: "#c8e6c9", fontSize: 12, marginTop: 2 },

  timerBox: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  timerLabel: { color: "#c8e6c9", fontSize: 10 },
  timerValue: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 15,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  input: { marginLeft: 10, flex: 1 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "30%",
  },

  statNum: { fontWeight: "bold", color: "#1b5e20" },
  statText: { fontSize: 10, color: "#666" },

  section: {
    marginLeft: 15,
    marginTop: 15,
    fontWeight: "bold",
    color: "#1b5e20",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 10,
  },

  gridCard: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 14,
    alignItems: "center",
  },

  gridText: { marginTop: 6, fontSize: 12 },
});