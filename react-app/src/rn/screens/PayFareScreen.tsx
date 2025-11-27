import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { payFare } from '../api';

type Props = { token: string };

const PayFareScreen: React.FC<Props> = ({ token }) => {
  const [plate, setPlate] = useState('');
  const [amount, setAmount] = useState('50');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      await payFare(token, plate.toUpperCase(), Number(amount), phone);
      Alert.alert('Success', 'Fare sent to vehicle');
      setPlate('');
      setAmount('50');
    } catch (error: any) {
      Alert.alert('Payment failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Fare</Text>
      <TextInput
        style={styles.input}
        placeholder="Vehicle plate (e.g., KBA123A)"
        autoCapitalize="characters"
        value={plate}
        onChangeText={setPlate}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Your phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button title={loading ? 'Paying...' : 'Pay now'} onPress={handlePay} disabled={!plate || !amount || !phone || loading} />
      <Text style={styles.hint}>You can also add a QR scanner and set the plate automatically.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  hint: { marginTop: 12, color: '#666' },
});

export default PayFareScreen;
