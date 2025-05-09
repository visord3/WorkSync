// shiftsCalenderScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useAuth } from '../services/auth/auth.service';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase/firebaseconfig';
import { Shift, ShiftStatus } from '../services/shifts/shifts.model';
import { Calendar } from 'react-native-calendars';
import { useShifts } from '../services/shifts/shifts.service';

// Interface for the marked dates
interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    selectedColor?: string;
  };
}

const ShiftsCalendarScreen = () => {
  const { user } = useAuth();
  const { clockIn, clockOut } = useShifts();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [shiftsForSelectedDate, setShiftsForSelectedDate] = useState<Shift[]>([]);
  
  // Load shifts for current user
  useEffect(() => {
    const fetchShifts = async () => {
      if (!user?.uid) return;
      
      try {
        // Query for shifts assigned to this employee
        const shiftsQuery = query(
          collection(db, 'shifts'),
          where('employeeId', '==', user.uid),
          orderBy('start', 'asc')
        );
        
        const querySnapshot = await getDocs(shiftsQuery);
        const fetchedShifts: Shift[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedShifts.push({
            id: doc.id,
            ...doc.data()
          } as Shift);
        });
        
        setShifts(fetchedShifts);
        
        // Create marked dates for calendar
        const dates: MarkedDates = {};
        fetchedShifts.forEach(shift => {
          const date = shift.start.toDate().toISOString().split('T')[0];
          dates[date] = {
            marked: true,
            selectedColor: shift.status === ShiftStatus.COMPLETED ? '#2ecc71' : 
                          shift.status === ShiftStatus.IN_PROGRESS ? '#f39c12' : '#3498db'
          };
        });
        
        setMarkedDates(dates);
        
        // Set today as default selected date
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        updateShiftsForSelectedDate(today, fetchedShifts);
        
      } catch (error) {
        console.error('Error fetching shifts:', error);
        Alert.alert('Error', 'Failed to load shifts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShifts();
  }, [user]);
  
  // Update shifts when date is selected
  const updateShiftsForSelectedDate = (date: string, allShifts: Shift[] = shifts) => {
    const filtered = allShifts.filter(shift => {
      const shiftDate = shift.start.toDate().toISOString().split('T')[0];
      return shiftDate === date;
    });
    
    setShiftsForSelectedDate(filtered);
  };
  
  // Handle date selection
  const onDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
    updateShiftsForSelectedDate(day.dateString);
  };
  
  // Format time for display (HH:MM)
  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle clock in
  const handleClockIn = async (shiftId: string) => {
    try {
      const success = await clockIn(shiftId);
      if (success) {
        // Update the local shift status - using Timestamp directly instead of firebase.firestore
        const now = Timestamp.now(); // Fixed: removed firebase.firestore prefix
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === shiftId 
              ? { ...shift, status: ShiftStatus.IN_PROGRESS, clockIn: now } 
              : shift
          )
        );
        
        // Update shifts for selected date
        updateShiftsForSelectedDate(selectedDate);
        
        Alert.alert('Success', 'You have clocked in successfully!');
      } else {
        Alert.alert('Error', 'Failed to clock in. Please try again.');
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // Handle clock out
  const handleClockOut = async (shiftId: string) => {
    try {
      const success = await clockOut(shiftId);
      if (success) {
        // Update the local shift status - using Timestamp directly instead of firebase.firestore
        const now = Timestamp.now(); // Fixed: removed firebase.firestore prefix
        setShifts(prevShifts => 
          prevShifts.map(shift => 
            shift.id === shiftId 
              ? { ...shift, status: ShiftStatus.COMPLETED, clockOut: now } 
              : shift
          )
        );
        
        // Update shifts for selected date
        updateShiftsForSelectedDate(selectedDate);
        
        Alert.alert('Success', 'You have clocked out successfully!');
      } else {
        Alert.alert('Error', 'Failed to clock out. Please try again.');
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // Render a shift item
  const renderShiftItem = ({ item }: { item: Shift }) => {
    const isScheduled = item.status === ShiftStatus.SCHEDULED;
    const isInProgress = item.status === ShiftStatus.IN_PROGRESS;
    const isCompleted = item.status === ShiftStatus.COMPLETED;
    
    return (
      <View style={[
        styles.shiftItem, 
        isScheduled ? styles.scheduledShift : 
        isInProgress ? styles.inProgressShift : 
        styles.completedShift
      ]}>
        <View style={styles.shiftHeader}>
          <Text style={styles.shiftTime}>
            {formatTime(item.start)} - {formatTime(item.end)}
          </Text>
          <Text style={styles.shiftStatus}>{item.status.toUpperCase()}</Text>
        </View>
        
        {item.department && (
          <Text style={styles.shiftDepartment}>Department: {item.department}</Text>
        )}
        
        {item.notes && (
          <Text style={styles.shiftNotes}>Notes: {item.notes}</Text>
        )}
        
        <View style={styles.clockButtons}>
          {isScheduled && (
            <TouchableOpacity 
              style={[styles.clockButton, styles.clockInButton]}
              onPress={() => handleClockIn(item.id || '')}
            >
              <Text style={styles.clockButtonText}>CLOCK IN</Text>
            </TouchableOpacity>
          )}
          
          {isInProgress && (
            <TouchableOpacity 
              style={[styles.clockButton, styles.clockOutButton]}
              onPress={() => handleClockOut(item.id || '')}
            >
              <Text style={styles.clockButtonText}>CLOCK OUT</Text>
            </TouchableOpacity>
          )}
          
          {isCompleted && (
            <View style={styles.clockTimes}>
              <Text style={styles.clockTimeText}>
                In: {item.clockIn ? formatTime(item.clockIn) : 'N/A'}
              </Text>
              <Text style={styles.clockTimeText}>
                Out: {item.clockOut ? formatTime(item.clockOut) : 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Shifts</Text>
      
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true
          }
        }}
        onDayPress={onDayPress}
        theme={{
          selectedDayBackgroundColor: '#3498db',
          todayTextColor: '#3498db',
          arrowColor: '#3498db',
        }}
      />
      
      <View style={styles.shiftsContainer}>
        <Text style={styles.dateTitle}>
          {new Date(selectedDate).toDateString()}
        </Text>
        
        {shiftsForSelectedDate.length > 0 ? (
          <FlatList
            data={shiftsForSelectedDate}
            renderItem={renderShiftItem}
            keyExtractor={(item) => item.id || ''}
            contentContainerStyle={styles.shiftsList}
          />
        ) : (
          <View style={styles.noShifts}>
            <Text style={styles.noShiftsText}>No shifts scheduled for this day</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ShiftsCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  shiftsContainer: {
    flex: 1,
    padding: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  shiftsList: {
    paddingBottom: 20,
  },
  shiftItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledShift: {
    backgroundColor: '#ecf0f1',
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  inProgressShift: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 5,
    borderLeftColor: '#f39c12',
  },
  completedShift: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  shiftDepartment: {
    fontSize: 14,
    marginBottom: 5,
  },
  shiftNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  clockButtons: {
    marginTop: 10,
  },
  clockButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: '#2ecc71',
  },
  clockOutButton: {
    backgroundColor: '#f39c12',
  },
  clockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clockTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 5,
  },
  clockTimeText: {
    fontSize: 12,
  },
  noShifts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noShiftsText: {
    fontSize: 16,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
});