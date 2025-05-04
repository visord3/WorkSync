

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type SuccessRouteProp = RouteProp<{ Success: { email: string } }, 'Success'>;

const SuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SuccessRouteProp>();
  const { email } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Created!</Text>
      <Text style={styles.message}>
        The admin account for {email} has been successfully created.
      </Text>
      <Button
        title="Back to Admin List"
        
      />
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});