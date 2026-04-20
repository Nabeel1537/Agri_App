import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const [chartData, setChartData] = useState([72, 74, 73, 78, 80, 77, 85]);
  const [timeLeft, setTimeLeft] = useState(300);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const arr = [...prev.slice(1)];
        const last = arr[arr.length - 1];

        let next = last + (Math.random() * 3 - 1.5);
        next = Math.max(60, Math.min(100, next));

        arr.push(Number(next.toFixed(1)));
        return arr;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((p) => (p > 0 ? p - 1 : 300));
    }, 1000);

    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>AMIS Records</Text>
        <Text style={styles.sub}>
          Agriculture Market Intelligence System
        </Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>Auto Refresh</Text>
          <Text style={styles.timerValue}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* METRICS */}
        <View style={styles.grid}>
          {metrics.map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        {/* VEGETABLES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🥦 Vegetables</Text>
          {vegetables.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          ))}
        </View>

        {/* FRUITS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍎 Fruits</Text>
          {fruits.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          ))}
        </View>

        {/* GRAPH */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Live Price Trend</Text>

          <LineChart
            data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{ data: chartData }],
            }}
            width={screenWidth - 40}
            height={200}
            bezier
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 1,
              color: (o = 1) => `rgba(22,163,74,${o})`,
              labelColor: (o = 1) => `rgba(0,0,0,${o})`,
            }}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* SUBMISSIONS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Recent Records</Text>

          {submissions.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{s.agent}</Text>
              <Text style={styles.cell}>{s.market}</Text>
              <Text style={[styles.cell, styles.priceBold]}>
                {s.price}
              </Text>
            </View>
          ))}
        </View>

        {/* ALERTS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚨 Alerts</Text>

          {alerts.map((a, i) => (
            <View key={i} style={styles.alertRow}>
              <View style={styles.dot} />
              <Text style={styles.alertText}>{a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- DATA ---------------- */

const metrics = [
  { label: "Markets", value: "24", sub: "+3 this week" },
  { label: "Entries", value: "186", sub: "87% synced" },
  { label: "Items", value: "42", sub: "Veg + Fruit" },
  { label: "Change", value: "+4.2%", sub: "vs yesterday" },
];

const vegetables = [
  { name: "Tomato", price: "Rs 85/kg" },
  { name: "Onion", price: "Rs 60/kg" },
];

const fruits = [
  { name: "Mango", price: "Rs 200/kg" },
  { name: "Banana", price: "Rs 50/dozen" },
];

const submissions = [
  { agent: "Zafar", market: "Hyderabad", price: "85/kg" },
  { agent: "Nadia", market: "Sukkur", price: "60/kg" },
];

const alerts = [
  "Tomato prices increased",
  "New data synced",
  "Mango demand rising",
];

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },

  header: {
    backgroundColor: "#166534",
    padding: 18,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  title: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  sub: { fontSize: 12, color: "#d1fae5" },

  timerBox: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  timerLabel: { color: "#d1fae5", fontSize: 10 },
  timerValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  scroll: { padding: 12, paddingBottom: 30 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  metricCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  metricLabel: { fontSize: 12, color: "#6b7280" },
  metricValue: { fontSize: 18, fontWeight: "bold", color: "#14532d" },
  metricSub: { fontSize: 11, color: "#16a34a" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#14532d",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  name: { fontSize: 13 },
  price: { fontSize: 13, fontWeight: "bold", color: "#14532d" },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  cell: { flex: 1, fontSize: 12 },

  priceBold: {
    fontWeight: "bold",
    color: "#16a34a",
  },

  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    marginRight: 8,
  },

  alertText: {
    fontSize: 12,
  },
});