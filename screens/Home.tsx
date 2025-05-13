// screens/Home.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, UserRole } from '../services/auth/auth.service';
import { THEME } from '../App';
import Card from '../components/card';
import Button from '../components/Button';
import Container from '../components/container';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Menu item component
interface MenuItemProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

const MenuItem = ({ title, description, icon, onPress }: MenuItemProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.menuItemTextContent}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          <Text style={styles.menuItemDescription}>{description}</Text>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

// Dashboard card component
interface DashboardCardProps {
  title: string;
  value: string;
  color: string;
}

const DashboardCard = ({ title, value, color }: DashboardCardProps) => (
  <Card style={[styles.dashboardCard, { borderLeftColor: color, borderLeftWidth: 5 }]}>
    <Text style={styles.dashboardCardTitle}>{title}</Text>
    <Text style={[styles.dashboardCardValue, { color }]}>{value}</Text>
  </Card>
);

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  // Get user's first name
  const getFirstName = () => {
    if (!user?.displayName) return '';
    return user.displayName.split(' ')[0];
  };
  
  return (
    <Container scroll={true} padding={false}>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {getFirstName() || 'User'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        {/* Dashboard */}
        <Text style={styles.sectionTitle}>Dashboard</Text>
        
        {/* Super Admin Dashboard */}
        {user && user.role === UserRole.SUPER_ADMIN && (
          <>
            <View style={styles.dashboardGrid}>
              <DashboardCard title="Total Admins" value="4" color={THEME.colors.primary} />
              <DashboardCard title="Total Employees" value="32" color={THEME.colors.secondary} />
            </View>
            
            <Text style={styles.sectionTitle}>Management</Text>
            
            <MenuItem
              title="Create Admin"
              description="Add a new administrator account"
              icon="👤"
              onPress={() => navigation.navigate('CreateAdmin')}
            />
          </>
        )}
        
        {/* Admin Dashboard */}
        {user && user.role === UserRole.ADMIN && (
          <>
            <View style={styles.dashboardGrid}>
              <DashboardCard title="Total Employees" value="12" color={THEME.colors.primary} />
              <DashboardCard title="Active Shifts" value="5" color={THEME.colors.accent} />
            </View>
            
            <Text style={styles.sectionTitle}>Management</Text>
            
            <MenuItem
              title="Create Employee"
              description="Add a new employee to your team"
              icon="👤"
              onPress={() => navigation.navigate('CreateEmployee')}
            />
            
            <MenuItem
              title="Create Shift"
              description="Schedule a new shift for an employee"
              icon="📅"
              onPress={() => navigation.navigate('CreateShift')}
            />
          </>
        )}
        
        {/* Employee Dashboard */}
        {user && user.role === UserRole.EMPLOYEE && (
          <>
            <View style={styles.dashboardGrid}>
              <DashboardCard title="Today's Shifts" value="1" color={THEME.colors.primary} />
              <DashboardCard title="Hours This Week" value="24.5" color={THEME.colors.secondary} />
            </View>
            
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <MenuItem
              title="View Shifts Calendar"
              description="See your scheduled shifts"
              icon="📅"
              onPress={() => navigation.navigate('ShiftsCalendar')}
            />
            
            <View style={styles.actionsContainer}>
              <Button
                title="Clock In"
                type="secondary"
                onPress={() => {/* Handle clock in */}}
                style={styles.clockButton}
              />
              <Button
                title="Clock Out"
                type="primary"
                onPress={() => {/* Handle clock out */}}
                style={styles.clockButton}
              />
            </View>
          </>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.large,
  },
  greeting: {
    fontSize: THEME.fontSize.xlarge,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: THEME.fontSize.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: THEME.borderRadius.round,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: THEME.spacing.large,
    flex: 1,
  },
  sectionTitle: {
    fontSize: THEME.fontSize.large,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.large,
    marginBottom: THEME.spacing.medium,
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    flex: 0.48,
    padding: THEME.spacing.medium,
  },
  dashboardCardTitle: {
    fontSize: THEME.fontSize.small,
    color: THEME.colors.textLight,
    marginBottom: 5,
  },
  dashboardCardValue: {
    fontSize: THEME.fontSize.xlarge,
    fontWeight: 'bold',
  },
  menuItem: {
    marginBottom: THEME.spacing.medium,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.medium,
  },
  iconText: {
    fontSize: 24,
  },
  menuItemTextContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: THEME.fontSize.medium,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 3,
  },
  menuItemDescription: {
    fontSize: THEME.fontSize.small,
    color: THEME.colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.medium,
  },
  clockButton: {
    flex: 0.48,
  },
});

export default HomeScreen;