import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateAdminScreen from '../screens/SAcreateAdmin';
import HomeScreen from '../screens/Home';
import { AppRegistry } from 'react-native';
import SuccessScreen  from '../screens/success'
export type RootStackParamList={
    Home:undefined
    CreateAdmin:undefined
    Success: { email: string };
};

 const Stack=createNativeStackNavigator<RootStackParamList>();
 const AppNavigator=()=>{
return(

    <NavigationContainer>

    <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={HomeScreen}
        options={{headerShown:false}}/>
        
        <Stack.Screen name="CreateAdmin" component={CreateAdminScreen}/>
        <Stack.Screen name="Success" component={SuccessScreen}/>

    </Stack.Navigator>
    </NavigationContainer>
);
 };

 export default AppNavigator;