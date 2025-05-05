// CreateShiftScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/AppNavigator';
import { db, functions } from '../services/firebase/firebaseconfig';
import { useAuth } from '../services/auth/auth.service';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type CreateShiftScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateShift'>;

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface ShiftFormData {
  employeeId: string;
  start: Date;
  end: Date;
  department: string;
  notes: string;
}

const CreateShiftScreen = () => {
  const navigation = useNavigation<CreateShiftScreenNavigationProp>();
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ShiftFormData>({
    employeeId: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // 8 hours later
    department: '',
    notes: '',
  });
  
  // Show date/time pickers
  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  
  // Load employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Only fetch employees created by this admin (or all employees if superAdmin)
        const employeesQuery = query(
          collection(db, 'users'),
          where('role', '==', 'employee')
        );
        
        const querySnapshot = await getDocs(employeesQuery);
        const fetchedEmployees: Employee[] = [];
        
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          fetchedEmployees.push({
            id: doc.id,
            name: employeeData.name || '',
            email: employeeData.email || '',
            department: employeeData.department,
          });
        });
        
        setEmployees(fetchedEmployees);
        
        // Set default employee if available
        if (fetchedEmployees.length > 0) {
          setFormData(prev => ({
            ...prev,
            employeeId: fetchedEmployees[0].id,
            department: fetchedEmployees[0].department || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        Alert.alert('Error', 'Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, [user]);
  
  // Handle changes to form data
  const handleChange = (key: keyof ShiftFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle date/time picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (showStartDate) {
      setShowStartDate(false);
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        const currentStart = new Date(formData.start);
        
        newDate.setHours(currentStart.getHours());
        newDate.setMinutes(currentStart.getMinutes());
        
        handleChange('start', newDate);
      }
    }
    else if (showStartTime) {
      setShowStartTime(false);
      if (selectedDate) {
        const newTime = new Date(selectedDate);
        const currentStart = new Date(formData.start);
        
        currentStart.setHours(newTime.getHours());
        currentStart.setMinutes(newTime.getMinutes());
        
        handleChange('start', currentStart);
      }
    }
    else if (showEndDate) {
      setShowEndDate(false);
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        const currentEnd = new Date(formData.end);
        
        newDate.setHours(currentEnd.getHours());
        newDate.setMinutes(currentEnd.getMinutes());
        
        handleChange('end', newDate);
      }
    }
    else if (showEndTime) {
      setShowEndTime(false);
      if (selectedDate) {
        const newTime = new Date(selectedDate);
        const currentEnd = new Date(formData.end);
        
        currentEnd.setHours(newTime.getHours());
        currentEnd.setMinutes(newTime.getMinutes());
        
        handleChange('end', currentEnd);
      }
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Create the shift
  const handleCreateShift = async () => {
    // Validate form data
    if (!formData.employeeId) {
      return Alert.alert('Error', 'Please select an employee.');
    }
    
    if (formData.start >= formData.end) {
      return Alert.alert('Error', 'End time must be after start time.');
    }
    
    setSubmitting(true);
    
    try {
      // Create shift document in Firestore
      const shiftData = {
        employeeId: formData.employeeId,
        start: Timestamp.fromDate(formData.start),
        end: Timestamp.fromDate(formData.end),
        department: formData.department,
        notes: formData.notes,
        status: 'scheduled', // Default status
        createdBy: user?.uid,
        createdAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(collection(db, 'shifts'), shiftData);
      
      // Find the employee's email for the success screen
      const employee = employees.find(e => e.id === formData.employeeId);
      
      Alert.alert(
        'Success',
        `Shift created for ${employee?.name || 'employee'}`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
      
      // Reset form
      setFormData({
        employeeId: employees.length > 0 ? employees[0].id : '',
        start: new Date(),
        end: new Date(new Date().getTime() + 8 * 60 * 60 * 1000),
        department: employees.length > 0 ? employees[0].department || '' : '',
        notes: '',
      });
      
    } catch (error) {
      console.error('Error creating shift:', error);
      Alert.alert('Error', 'Failed to create shift. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create New Shift</Text>
        
        {/* Employee Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Employee</Text>
          
          {employees.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.employeeId}
                onValueChange={(itemValue) => {
                  const employee = employees.find(e => e.id === itemValue);
                  handleChange('employeeId', itemValue);
                  if (employee?.department) {
                    handleChange('department', employee.department);
                  }
                }}
                style={styles.picker}
              >
                {employees.map((employee) => (
                  <Picker.Item 
                    key={employee.id} 
                    label={`${employee.name} (${employee.email})`} 
                    value={employee.id} 
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.noEmployeesText}>
              No employees found. Please create an employee first.
            </Text>
          )}
        </View>
        
        {/* Date and Time Selection */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeColumn}>
            <Text style={styles.label}>Start Date & Time</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowStartDate(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(formData.start)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowStartTime(true)}
            >
              <Text style={styles.dateTimeText}>{formatTime(formData.start)}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateTimeColumn}>
            <Text style={styles.label}>End Date & Time</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowEndDate(true)}
            >
              <Text style={styles.dateTimeText}>{formatDate(formData.end)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowEndTime(true)}
            >
              <Text style={styles.dateTimeText}>{formatTime(formData.end)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Department */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            value={formData.department}
            onChangeText={(value) => handleChange('department', value)}
            placeholder="Enter department"
          />
        </View>
        
        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder="Enter any notes about this shift"
            multiline
            numberOfLines={4}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateShift}
          disabled={submitting || employees.length === 0}
        >
          <Text style={styles.createButtonText}>
            {submitting ? 'Creating...' : 'Create Shift'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Date/Time Pickers */}
      {(showStartDate || showEndDate) && (
        <DateTimePicker
          value={showStartDate ? formData.start : formData.end}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      {(showStartTime || showEndTime) && (
        <DateTimePicker
          value={showStartTime ? formData.start : formData.end}
          mode="time"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

export default CreateShiftScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#34495e',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  noEmployeesText: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    color: '#c62828',
    textAlign: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeColumn: {
    flex: 1,
    marginRight: 10,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  timePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  createButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },