import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { login } from '../api';

type Props = { onLoggedIn: (token: string) => void };

const LoginScreen: React.FC<Props> = ({ onLoggedIn }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { token } = await login(phone);
      onLoggedIn(token);
    } catch (error: any) {
      Alert.alert('Login failed', error.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Lipa Fare</Text>
      <Text style={styles.label}>Phone number</Text>
      <TextInput
        style={styles.input}
        placeholder="07xx xxx xxx"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={!phone || loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default LoginScreen;
