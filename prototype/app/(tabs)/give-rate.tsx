import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { db, escapeSql } from "../../db/database";
import { syncForms } from "../../sync/syncForms";

type Entry = { item: string; min: string; max: string };

type FormRow = {
  id: number;
  date: string;
  category: string;
  district: string;
  market: string;
  data: string;
  synced: number;
};

export default function GiveRate() {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const [category, setCategory] = useState("Select Category");
  const [district, setDistrict] = useState("Select District");
  const [market, setMarket] = useState("Select Market");

  const [entries, setEntries] = useState<Entry[]>([
    { item: "Select Item", min: "", max: "" },
  ]);

  const [dataList, setDataList] = useState<FormRow[]>([]);
  const [modalType, setModalType] = useState<
    null | "category" | "district" | "market" | number
  >(null);

  const [districts, setDistricts] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const d = new Date();
    setDate(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
    loadAll();
  }, []);

  /* ---------------- SAFE DB LOAD ---------------- */
  const safeQuery = (query: string) => {
    try {
      return db.getAllSync(query) || [];
    } catch (e) {
      console.log("DB ERROR:", query, e);
      return [];
    }
  };

  const loadAll = () => {
    setDistricts(safeQuery("SELECT * FROM districts"));
    setMarkets(safeQuery("SELECT * FROM markets"));
    setCategories(safeQuery("SELECT * FROM categories"));
    setItems(safeQuery("SELECT * FROM items"));
    loadForms();
  };

  const loadForms = () => {
    try {
      const res = safeQuery(
        "SELECT * FROM market_forms ORDER BY id DESC"
      ) as FormRow[];
      setDataList(res);
    } catch (e) {
      console.log(e);
    }
  };

  const pendingCount = dataList.filter((row) => Number(row.synced) === 0).length;
  const syncedCount = dataList.filter((row) => Number(row.synced) === 1).length;
  const pendingDataList = dataList.filter((row) => Number(row.synced) === 0);

  const handleSync = async () => {
    try {
      await syncForms();
      loadForms();
      setMessage("✅ Sync complete");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.log("SYNC BUTTON ERROR:", error);
      setMessage("❌ Sync failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  /* ---------------- ENTRY HANDLERS ---------------- */
  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { item: "Select Item", min: "", max: "" },
    ]);
  };

  const updateEntry = (index: number, key: keyof Entry, value: string) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  };

  const deleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SAVE ---------------- */
  const saveData = async () => {
    const valid = entries.filter(
      (e) => e.item !== "Select Item" && e.min && e.max
    );

    if (category === "Select Category") {
      setMessage("❌ Select Category");
      return;
    }

    if (district === "Select District") {
      setMessage("❌ Select District");
      return;
    }

    if (market === "Select Market") {
      setMessage("❌ Select Market");
      return;
    }

    if (!valid.length) {
      setMessage("❌ Fill entries properly");
      return;
    }

    try {
      const escapedDate = escapeSql(date);
      const escapedCategory = escapeSql(category);
      const escapedDistrict = escapeSql(district);
      const escapedMarket = escapeSql(market);
      const escapedData = escapeSql(JSON.stringify(valid));

      db.execSync(`
        INSERT INTO market_forms
        (date, category, district, market, data, synced, created_at)
        VALUES (
          '${escapedDate}',
          '${escapedCategory}',
          '${escapedDistrict}',
          '${escapedMarket}',
          '${escapedData}',
          0,
          datetime('now')
        );
      `);

      await syncForms().catch((err) => {
        console.log("SYNC ERROR:", err);
      });

      setMessage("✅ Form saved successfully");

      loadForms();
      setEntries([{ item: "Select Item", min: "", max: "" }]);

      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.log("SAVE ERROR:", e);
      setMessage("❌ Failed to save form");
    }
  };

  /* ---------------- FILTERS ---------------- */
  const selectedCategory = categories.find((c) => c.name === category);
  const selectedDistrict = districts.find((d) => d.name === district);

  const getMarkets = () => {
    if (!selectedDistrict) return [];
    return markets.filter(
      (m) => Number(m.district_id) === Number(selectedDistrict.id)
    );
  };

  const getItems = () => {
    if (!selectedCategory) return [];
    return items.filter(
      (i) => Number(i.category_id) === Number(selectedCategory.id)
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🌾 Market Form</Text>

        {/* MESSAGE */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text>Date: {date}</Text>

        {/* CATEGORY */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.box} onPress={() => setModalType("category")}>
          <Text>{category}</Text>
        </TouchableOpacity>

        {/* DISTRICT */}
        <Text style={styles.label}>District</Text>
        <TouchableOpacity
          style={styles.box}
          onPress={() => {
            if (category === "Select Category")
              return Alert.alert("Select Category first");
            setModalType("district");
          }}
        >
          <Text>{district}</Text>
        </TouchableOpacity>

        {/* MARKET */}
        <Text style={styles.label}>Market</Text>
        <TouchableOpacity
          style={styles.box}
          onPress={() => {
            if (district === "Select District")
              return Alert.alert("Select District first");
            setModalType("market");
          }}
        >
          <Text>{market}</Text>
        </TouchableOpacity>

        {/* ENTRIES */}
        <Text style={styles.label}>Entries</Text>

        {entries.map((e, i) => (
          <View key={`${i}-${e.item}`} style={styles.row}>
            <TouchableOpacity
              style={styles.itemBox}
              onPress={() => {
                if (market === "Select Market")
                  return Alert.alert("Select Market first");
                setModalType(i);
              }}
            >
              <Text>{e.item}</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Min"
              value={e.min}
              onChangeText={(v) => updateEntry(i, "min", v)}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Max"
              value={e.max}
              onChangeText={(v) => updateEntry(i, "max", v)}
              style={styles.input}
              keyboardType="numeric"
            />

            <TouchableOpacity onPress={() => deleteEntry(i)}>
              <Ionicons name="trash" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addEntry}>
          <Text style={{ color: "#fff" }}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={saveData}>
          <Text style={{ color: "#fff" }}>Save</Text>
        </TouchableOpacity>

        {/* ---------------- RECORD LIST ---------------- */}
        <View style={styles.syncHeader}>
          <Text style={[styles.label, { marginTop: 20 }]}>📋 Pending Records</Text>
          <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
            <Text style={styles.syncBtnText}>Sync Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.syncSummaryRow}>
          <Text style={styles.syncSummary}>Synced: {syncedCount}</Text>
          <Text style={styles.syncSummary}>Pending: {pendingCount}</Text>
        </View>

        {pendingDataList.length === 0 ? (
          <Text>No pending records</Text>
        ) : (
          pendingDataList.map((row) => {
            let parsed: Entry[] = [];

            try {
              parsed = JSON.parse(row.data);
            } catch (e) {}

            return (
              <View key={row.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {row.category} | {row.market}
                </Text>

                <Text>Date: {row.date}</Text>
                <Text>District: {row.district}</Text>

                {parsed.map((p, i) => (
                  <Text key={i}>
                    • {p.item}: {p.min} - {p.max}
                  </Text>
                ))}

                <Text style={{ color: row.synced ? "green" : "orange" }}>
                  {row.synced ? "Synced ✅" : "Pending ⏳"}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalType !== null} transparent>
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <ScrollView>
              {modalType === "category" &&
                categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      setCategory(c.name);
                      setDistrict("Select District");
                      setMarket("Select Market");
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.option}>{c.name}</Text>
                  </TouchableOpacity>
                ))}

              {modalType === "district" &&
                districts.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => {
                      setDistrict(d.name);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.option}>{d.name}</Text>
                  </TouchableOpacity>
                ))}

              {modalType === "market" &&
                getMarkets().map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => {
                      setMarket(m.name);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.option}>{m.name}</Text>
                  </TouchableOpacity>
                ))}

              {typeof modalType === "number" &&
                getItems().map((i) => (
                  <TouchableOpacity
                    key={i.id}
                    onPress={() => {
                      updateEntry(modalType, "item", i.name);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.option}>{i.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4fbf4" },
  title: { fontSize: 20, fontWeight: "bold" },
  label: { marginTop: 10, fontWeight: "bold" },

  message: {
    backgroundColor: "#e8f5e9",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    color: "#1b5e20",
    fontWeight: "bold",
  },

  box: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginTop: 5 },

  row: { flexDirection: "row", marginTop: 10, alignItems: "center" },

  itemBox: { flex: 2, backgroundColor: "#fff", padding: 8, marginRight: 5 },

  input: { flex: 1, backgroundColor: "#fff", marginRight: 5, padding: 8 },

  addBtn: { backgroundColor: "#2e7d32", padding: 12, marginTop: 10 },
  saveBtn: { backgroundColor: "#1b5e20", padding: 14, marginTop: 10 },

  syncHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  syncSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  syncSummary: {
    fontSize: 13,
    color: "#333",
  },
  syncBtn: {
    backgroundColor: "#388e3c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  syncBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 10,
  },

  option: { padding: 12 },
});