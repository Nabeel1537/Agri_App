import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, escapeSql } from '../db/database';

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = () => {
    try {
      if (!name || !email || !password) {
        Alert.alert('Error', 'Fill all required fields');
        return;
      }

      const escapedName = escapeSql(name);
      const escapedEmail = escapeSql(email);
      const escapedPassword = escapeSql(password);
      const escapedPhone = escapeSql(phone);

      db.execSync(`
        INSERT INTO users (name, email, password, phone, synced, created_at)
        VALUES (
          '${escapedName}',
          '${escapedEmail}',
          '${escapedPassword}',
          '${escapedPhone}',
          0,
          datetime('now')
        );
      `);

      Alert.alert('Success', 'User saved offline');
      router.replace('/login');

    } catch (error) {
      console.log('Signup Error:', error);
      Alert.alert('Error', 'User already exists or DB error');
    }
  };

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to continue</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />

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

      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        placeholderTextColor="#888"
      />

      {/* Signup Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Go to Login */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}> Login</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F4',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
  },

  subtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 30,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  footerText: {
    color: '#4CAF50',
  },

  link: {
    color: '#1B5E20',
    fontWeight: 'bold',
  },
});