import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { fetchTrips, Trip } from '../api';

type Props = { token: string };

const TripHistoryScreen: React.FC<Props> = ({ token }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    setRefreshing(true);
    try {
      const data = await fetchTrips(token);
      setTrips(data);
    } catch (error) {
      // keep it silent for beginners; add logging in real app
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent trips</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTrips} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.plate}>{item.vehiclePlate}</Text>
            <Text style={styles.amount}>KSh {item.amount}</Text>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No trips yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  plate: { fontWeight: 'bold', fontSize: 16 },
  amount: { color: '#0a7', marginTop: 4 },
  time: { color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
});

export default TripHistoryScreen;
