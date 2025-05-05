import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import CreateAdminScreen from '../screens/SAcreateAdmin';
import HomeScreen from '../screens/Home';
import SuccessScreen from '../screens/success';
import { useAuth, UserRole } from '../services/auth/auth.service';
import LoginScreen from '../screens/logInPage';

export type RootStackParamList = {
    Home: undefined;
    CreateAdmin: undefined;
    Success: { email: string };
    Login: undefined;
    CreateEmployee: undefined;
    CreateShift: undefined;
    ShiftsCalendar: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { user, loading } = useAuth();

    // Show loading indicator while auth state is being determined
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                // Authenticated routes
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ headerShown: false }}
                    />
                    {/* Only show CreateAdmin screen for superAdmin users */}
                    {user.role === UserRole.SUPER_ADMIN && (
                        <Stack.Screen
                            name="CreateAdmin"
                            component={CreateAdminScreen}
                        />
                    )}
                    {/* Admin specific screens */}
                    {user.role === UserRole.ADMIN && (
                        <>
                            <Stack.Screen
                                name="CreateEmployee"
                                component={require('../screens/CreateEmployeeScreen').default}
                            />
                            <Stack.Screen
                                name="CreateShift"
                                component={require('../screens/CreateShiftScreen').default}
                            />
                        </>
                    )}
                    {/* Employee specific screens */}
                    {user.role === UserRole.EMPLOYEE && (
                        <Stack.Screen
                            name="ShiftsCalendar"
                            component={require('../screens/ShiftsCalendarScreen').default}
                        />
                    )}
                    <Stack.Screen name="Success" component={SuccessScreen} />
                </Stack.Navigator>
            ) : (
                // Unauthenticated routes
                <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;