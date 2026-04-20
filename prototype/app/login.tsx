import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db, escapeSql } from "../db/database";

type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  synced: number;
};

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const saveSession = async (user: any) => {
    await AsyncStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        loggedIn: true,
      })
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // =========================
      // 🔵 OFFLINE LOGIN (SAFE)
      // =========================
      const rows = db.getAllSync(
        `SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1;`,
        [email, password]
      ) as User[];

      const localUser: User | null =
        rows && rows.length > 0 ? rows[0] : null;

      if (localUser) {
        console.log("OFFLINE LOGIN SUCCESS:", localUser);

        await saveSession(localUser);

        router.replace("/(tabs)/home");
        return;
      }

      // =========================
      // 🌐 ONLINE LOGIN
      // =========================
      const res = await fetch(
        "http://172.16.13.232/backend/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      console.log("ONLINE RESPONSE:", data);

      if (data?.status === "success" && data?.user) {
        const user: User = data.user;
        const escapedName = escapeSql(user.name);
        const escapedEmail = escapeSql(user.email);
        const escapedPassword = escapeSql(password);
        const escapedPhone = escapeSql(user.phone || "");

        // Save to SQLite
        db.execSync(`
          INSERT OR IGNORE INTO users 
          (name, email, password, phone, synced, created_at)
          VALUES (
            '${escapedName}',
            '${escapedEmail}',
            '${escapedPassword}',
            '${escapedPhone}',
            1,
            datetime('now')
          );
        `);

        await saveSession(user);

        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  subtitle: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  button: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: "#4CAF50",
  },

  link: {
    color: "#1B5E20",
    fontWeight: "bold",
  },
});