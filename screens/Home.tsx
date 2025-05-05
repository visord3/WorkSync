import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, UserRole } from '../services/auth/auth.service';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to WorkSync</Text>
      {user && user.role === UserRole.SUPER_ADMIN && (
        <>
          <Text style={styles.subtitle}>Super Admin Dashboard</Text>
          <Button
            title="Create Admin"
            onPress={() => navigation.navigate('CreateAdmin')}
          />
        </>
      )}
      {user && user.role === UserRole.ADMIN && (
        <Text style={styles.subtitle}>Admin Dashboard</Text>
      )}
      {user && user.role === UserRole.EMPLOYEE && (
        <Text style={styles.subtitle}>Employee Dashboard</Text>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});