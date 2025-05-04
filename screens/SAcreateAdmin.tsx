// CreateAdminScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

import {app} from '../services/firebase/firebaseconfig';

const CreateAdminScreen = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const createAdmin = async () => {
    const { name, email, password, phone, address } = form;
    if (!name || !email || !password) {
      return Alert.alert('Missing Info', 'Name, Email, and Password are required.');
    }
    
    setLoading(true);
    try {
      // Get the functions instance
      const functions = getFunctions(app);
      
      // Create a reference to the cloud function
      const createAdminFunction = httpsCallable(functions, 'createAdmin');
      
      // Call the function with the form data
      const result = await createAdminFunction({
        name,
        email,
        password,
        phone,
        address
      });
      
      // The result data will contain the uid and email from the cloud function
      const { uid, email: createdEmail } = result.data as { uid: string; email: string };
      
      Alert.alert('Success', `Admin ${createdEmail} created.`,
        
      );
      setForm({ name: '', email: '', password: '', phone: '', address: '' });
    } catch (err: any) {
      // Handle specific error codes from the cloud function
      const errorCode = err.code;
      const errorMessage = err.message;
      
      if (errorCode === 'permission-denied') {
        Alert.alert('Error', 'You do not have permission to create admins.');
      } else if (errorCode === 'invalid-argument') {
        Alert.alert('Error', 'Invalid information provided.');
      } else {
        Alert.alert('Error', errorMessage || 'Could not create admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Admin</Text>
      {(['name','email','password','phone','address'] as (keyof typeof form)[]).map(key => (
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
        title={loading ? 'Creating...' : 'Create Admin'}
        onPress={createAdmin}
        disabled={loading}
      />
    </View>
  );
};

export default CreateAdminScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 6 },
});