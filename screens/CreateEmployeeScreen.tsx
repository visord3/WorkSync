// CreateEmployeeScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { app } from '../services/firebase/firebaseconfig';

type CreateEmployeeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEmployee'>;

const CreateEmployeeScreen = () => {
  const navigation = useNavigation<CreateEmployeeScreenNavigationProp>();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const createEmployee = async () => {
    const { name, email, password, phone, address, department } = form;
    if (!name || !email || !password) {
      return Alert.alert('Missing Info', 'Name, Email, and Password are required.');
    }
    
    setLoading(true);
    try {
      // Get the functions instance
      const functions = getFunctions(app);
      
      // Create a reference to the cloud function
      const createEmployeeFunction = httpsCallable(functions, 'createEmployee');
      
      // Call the function with the form data
      const result = await createEmployeeFunction({
        name,
        email,
        password,
        phone,
        address,
        department
      });
      
      // The result data will contain the uid and email from the cloud function
      const { uid, email: createdEmail } = result.data as { uid: string; email: string };
      
      // Navigate to success screen
      navigation.navigate('Success', { email: createdEmail });
      
      // Clear form
      setForm({ name: '', email: '', password: '', phone: '', address: '', department: '' });
    } catch (err: any) {
      // Handle specific error codes from the cloud function
      const errorCode = err.code;
      const errorMessage = err.message;
      
      if (errorCode === 'permission-denied') {
        Alert.alert('Error', 'You do not have permission to create employees.');
      } else if (errorCode === 'invalid-argument') {
        Alert.alert('Error', 'Invalid information provided.');
      } else {
        Alert.alert('Error', errorMessage || 'Could not create employee.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Employee</Text>
      {(['name','email','password','phone','address','department'] as (keyof typeof form)[]).map(key => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={form[key]}
          onChangeText={v => handleChange(key, v)}
          {...(key === 'email' ? { keyboardType: 'email-address', autoCapitalize: 'none' } : {})}
          {...(key === 'password' ? { secureTextEntry: true } : {})}
          {...(key === 'phone' ? { keyboardType: 'phone-pad' } : {})}
        />
      ))}
      <Button
        title={loading ? 'Creating...' : 'Create Employee'}
        onPress={createEmployee}
        disabled={loading}
      />
    </View>
  );
};

export default CreateEmployeeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 6 },
});