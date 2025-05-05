import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateAdminScreen from '../../screens/SAcreateAdmin';
import HomeScreen from '../../screens/Home';
import { AppRegistry } from 'react-native';

 const Stack=createNativeStackNavigator();
 const AppNavigator=()=>{
return(

    <NavigationContainer>

    <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={HomeScreen}/>
        
        <Stack.Screen name="CreateAdmin" component={CreateAdminScreen}/>

    </Stack.Navigator>
    </NavigationContainer>
);
 };

 export default AppNavigator;