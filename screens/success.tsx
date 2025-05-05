import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/AppNavigator';

type SuccessRouteProp = RouteProp<RootStackParamList, 'Success'>;
type SuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Success'>;

const SuccessScreen = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const route = useRoute<SuccessRouteProp>();
  const { email } = route.params;

  // Determine the message based on the previous route
  const getPreviousScreenName = () => {
    const previousRoute = navigation.getState().routes[navigation.getState().routes.length - 2];
    return previousRoute?.name === 'CreateAdmin' 
      ? 'Admin' 
      : previousRoute?.name === 'CreateEmployee' 
        ? 'Employee' 
        : 'User';
  };

  const userType = getPreviousScreenName();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userType} Created!</Text>
      <Text style={styles.message}>
        The {userType.toLowerCase()} account for {email} has been successfully created.
      </Text>
      <Button
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
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