import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, UserRole } from '../services/auth/auth.service';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to WorkSync</Text>
      <Text style={styles.subtitle}>
        {user?.email ? `Logged in as: ${user.email}` : ''}
      </Text>
      
      {user && user.role === UserRole.SUPER_ADMIN && (
        <View style={styles.dashboardContainer}>
          <Text style={styles.subtitle}>Super Admin Dashboard</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateAdmin')}
          >
            <Text style={styles.buttonText}>Create Admin</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {user && user.role === UserRole.ADMIN && (
        <View style={styles.dashboardContainer}>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateEmployee')}
          >
            <Text style={styles.buttonText}>Create Employee</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {user && user.role === UserRole.EMPLOYEE && (
        <View style={styles.dashboardContainer}>
          <Text style={styles.subtitle}>Employee Dashboard</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Your upcoming shifts will appear here</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.clockInButton]}>
              <Text style={styles.actionButtonText}>CLOCK IN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.clockOutButton]}>
              <Text style={styles.actionButtonText}>CLOCK OUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]} 
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
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
    padding: 20,
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
  dashboardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: '#2ecc71',
  },
  clockOutButton: {
    backgroundColor: '#f39c12',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});