import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Button } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import PayFareScreen from './screens/PayFareScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import LoyaltyScreen from './screens/LoyaltyScreen';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  if (!token) {
    return <LoginScreen onLoggedIn={setToken} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 16 }}>
          <PayFareScreen token={token} />
          <TripHistoryScreen token={token} />
          <LoyaltyScreen token={token} />
          <Button title="Logout" onPress={() => setToken(null)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
