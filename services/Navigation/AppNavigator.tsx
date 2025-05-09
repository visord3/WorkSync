import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Direct imports for all screens - no more require()
import CreateAdminScreen from '../../screens/SAcreateAdmin';
import HomeScreen from '../../screens/Home';
import SuccessScreen from '../../screens/success';
import LoginScreen from '../../screens/logInPage';
import CreateEmployeeScreen from '../../screens/CreateEmployeeScreen';
import CreateShiftScreen from '../../screens/CreateShiftScreen';
import ShiftsCalendarScreen from '../../screens/shiftsCalenderScreen';
import { useAuth, UserRole } from '../../services/auth/auth.service';

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

// Admin-specific screens
const AdminScreens = () => (
  <>
    <Stack.Screen 
      name="CreateEmployee"
      component={CreateEmployeeScreen}
      options={{ 
        title: "Create Employee",
        headerStyle: { backgroundColor: '#3498db' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="CreateShift"
      component={CreateShiftScreen}
      options={{ 
        title: "Create Shift",
        headerStyle: { backgroundColor: '#3498db' },
        headerTintColor: '#fff',
      }}
    />
  </>
);

// SuperAdmin-specific screens
const SuperAdminScreens = () => (
  <Stack.Screen 
    name="CreateAdmin"
    component={CreateAdminScreen}
    options={{ 
      title: "Create Administrator",
      headerStyle: { backgroundColor: '#3498db' },
      headerTintColor: '#fff',
    }}
  />
);

// Employee-specific screens
const EmployeeScreens = () => (
  <Stack.Screen 
    name="ShiftsCalendar"
    component={ShiftsCalendarScreen}
    options={{ 
      title: "My Shifts",
      headerStyle: { backgroundColor: '#3498db' },
      headerTintColor: '#fff',
    }}
  />
);

const AppNavigator = () => {
    const { user, loading } = useAuth();
    const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Home');

    // Set initial route based on user role when auth state is determined
    useEffect(() => {
        if (!loading && user) {
            setInitialRoute('Home');
        } else if (!loading && !user) {
            setInitialRoute('Login');
        }
    }, [loading, user]);

    // Show loading indicator while auth state is being determined
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                // Authenticated routes
                <Stack.Navigator 
                  initialRouteName={initialRoute}
                  screenOptions={{
                    headerStyle: { backgroundColor: '#3498db' },
                    headerTintColor: '#fff',
                  }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ headerShown: false }}
                    />
                    
                    {/* Common screens for all roles */}
                    <Stack.Screen 
                      name="Success" 
                      component={SuccessScreen}
                      options={{ 
                        title: "Success",
                        headerStyle: { backgroundColor: '#2ecc71' },
                        headerTintColor: '#fff',
                      }}
                    />
                    
                    {/* Role-specific screens */}
                    {user.role === UserRole.SUPER_ADMIN && <SuperAdminScreens />}
                    {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && <AdminScreens />}
                    {user.role === UserRole.EMPLOYEE && <EmployeeScreens />}
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