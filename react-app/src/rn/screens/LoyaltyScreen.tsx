import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { fetchLoyalty, redeemPoints } from '../api';

type Props = { token: string };

const LoyaltyScreen: React.FC<Props> = ({ token }) => {
  const [balance, setBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [plate, setPlate] = useState('');

  const loadBalance = async () => {
    try {
      const result = await fetchLoyalty(token);
      setBalance(result.points);
    } catch (error) {
      // keep it simple for now
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleRedeem = async () => {
    try {
      await redeemPoints(token, plate.toUpperCase(), Number(pointsToRedeem));
      Alert.alert('Redeemed', 'Points used for your fare');
      setPointsToRedeem('');
      loadBalance();
    } catch (error: any) {
      Alert.alert('Redeem failed', error.message || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loyalty points</Text>
      <Text style={styles.balance}>{balance} pts</Text>
      <TextInput
        style={styles.input}
        placeholder="Vehicle plate"
        autoCapitalize="characters"
        value={plate}
        onChangeText={setPlate}
      />
      <TextInput
        style={styles.input}
        placeholder="Points to redeem"
        keyboardType="numeric"
        value={pointsToRedeem}
        onChangeText={setPointsToRedeem}
      />
      <Button
        title="Redeem points"
        onPress={handleRedeem}
        disabled={!plate || !pointsToRedeem}
        color="#0a7"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  balance: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, color: '#0a7' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default LoyaltyScreen;
