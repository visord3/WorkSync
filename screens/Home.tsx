import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'react-native';

 const HomeScreen = () => {
  type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<Navigation>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to WorkSync</Text>
      <Text style={styles.subtitle}>Super Admin Dashboard</Text>
      <Button
       title='createAdmin'
       onPress={()=>navigation.navigate('CreateAdmin')}/>
        
 
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
  },
});