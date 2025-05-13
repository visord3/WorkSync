import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Import all screens directly
import CreateAdminScreen from '../../screens/SAcreateAdmin';
import HomeScreen from '../../screens/Home';
import SuccessScreen from '../../screens/success';
import LoginScreen from '../../screens/logInPage';
import CreateEmployeeScreen from '../../screens/CreateEmployeeScreen';
import CreateShiftScreen from '../../screens/CreateShiftScreen';
import ShiftsCalendarScreen from '../../screens/ShiftsCalendarScreen';
import { useAuth, UserRole } from '../../services/auth/auth.service';
import { THEME } from '../../App';

export type RootStackParamList = {
    Home: undefined;
    CreateAdmin: undefined;
    CreateEmployee: undefined;
    CreateShift: undefined;
    ShiftsCalendar: undefined;
    Success: { email: string };
    Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { user, loading } = useAuth();

    // Show loading indicator while auth state is being determined
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                // Authenticated routes
                <Stack.Navigator 
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: { backgroundColor: THEME.colors.primary },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                        contentStyle: { backgroundColor: THEME.colors.background }
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ headerShown: false }}
                    />
                    
                    {/* Success screen available to all roles */}
                    <Stack.Screen 
                        name="Success" 
                        component={SuccessScreen}
                        options={{ 
                            title: "Success",
                            headerStyle: { backgroundColor: THEME.colors.secondary },
                        }}
                    />
                    
                    {/* Role-specific screens */}
                    {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                        <>
                            {user.role === UserRole.SUPER_ADMIN && (
                                <Stack.Screen
                                    name="CreateAdmin"
                                    component={CreateAdminScreen}
                                    options={{ title: "Create Administrator" }}
                                />
                            )}
                            
                            <Stack.Screen
                                name="CreateEmployee"
                                component={CreateEmployeeScreen}
                                options={{ title: "Create Employee" }}
                            />
                            
                            <Stack.Screen
                                name="CreateShift"
                                component={CreateShiftScreen}
                                options={{ title: "Create Shift" }}
                            />
                        </>
                    )}
                    
                    {user.role === UserRole.EMPLOYEE && (
                        <Stack.Screen
                            name="ShiftsCalendar"
                            component={ShiftsCalendarScreen}
                            options={{ title: "My Shifts" }}
                        />
                    )}
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