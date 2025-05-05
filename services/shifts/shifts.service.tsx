import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  Timestamp,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseconfig';
import { useAuth } from '../auth/auth.service';
import { Shift, ShiftStatus } from './shifts.model';

type ShiftsContextType = {
  loading: boolean;
  userShifts: Shift[];
  clockIn: (shiftId: string) => Promise<boolean>;
  clockOut: (shiftId: string) => Promise<boolean>;
  createShift: (shiftData: Omit<Shift, 'id' | 'status' | 'createdAt' | 'createdBy'>) => Promise<string | null>;
  refreshShifts: () => Promise<void>;
};

const ShiftsContext = createContext<ShiftsContextType | undefined>(undefined);

export function useShifts() {
  const context = useContext(ShiftsContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
}

export function ShiftsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const { user } = useAuth();

  // Load shifts based on user role
  useEffect(() => {
    if (user) {
      loadShifts();
    } else {
      setUserShifts([]);
    }
  }, [user]);

  // Load shifts from Firestore
  const loadShifts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let shiftsQuery;
      
      // Different queries based on user role
      if (user.role === 'employee') {
        // Employees only see their own shifts
        shiftsQuery = query(
          collection(db, 'shifts'),
          where('employeeId', '==', user.uid),
          orderBy('start', 'asc')
        );
      } else {
        // Admins and SuperAdmins see all shifts they created
        shiftsQuery = query(
          collection(db, 'shifts'),
          where('createdBy', '==', user.uid),
          orderBy('start', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(shiftsQuery);
      const shifts: Shift[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Shift, 'id'>;
        shifts.push({
          id: doc.id,
          ...data
        });
      });
      
      setUserShifts(shifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
      Alert.alert('Error', 'Failed to load shifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh shifts
  const refreshShifts = async () => {
    await loadShifts();
  };

  // Clock in for a shift
  const clockIn = async (shiftId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const shiftRef = doc(db, 'shifts', shiftId);
      await updateDoc(shiftRef, {
        status: ShiftStatus.IN_PROGRESS,
        clockIn: Timestamp.now()
      });
      
      // Update local state
      setUserShifts(prevShifts => 
        prevShifts.map(shift => 
          shift.id === shiftId 
            ? { 
                ...shift, 
                status: ShiftStatus.IN_PROGRESS, 
                clockIn: Timestamp.now() 
              } 
            : shift
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error clocking in:', error);
      return false;
    }
  };

  // Clock out from a shift
  const clockOut = async (shiftId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const shiftRef = doc(db, 'shifts', shiftId);
      await updateDoc(shiftRef, {
        status: ShiftStatus.COMPLETED,
        clockOut: Timestamp.now()
      });
      
      // Update local state
      setUserShifts(prevShifts => 
        prevShifts.map(shift => 
          shift.id === shiftId 
            ? { 
                ...shift, 
                status: ShiftStatus.COMPLETED, 
                clockOut: Timestamp.now() 
              } 
            : shift
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error clocking out:', error);
      return false;
    }
  };

  // Create a new shift
  const createShift = async (shiftData: Omit<Shift, 'id' | 'status' | 'createdAt' | 'createdBy'>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Prepare shift data
      const newShift = {
        ...shiftData,
        status: ShiftStatus.SCHEDULED,
        createdBy: user.uid,
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'shifts'), newShift);
      
      // Update local state
      setUserShifts(prevShifts => [
        ...prevShifts,
        {
          id: docRef.id,
          ...newShift
        }
      ]);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating shift:', error);
      return null;
    }
  };

  return (
    <ShiftsContext.Provider value={{
      loading,
      userShifts,
      clockIn,
      clockOut,
      createShift,
      refreshShifts
    }}>
      {children}
    </ShiftsContext.Provider>
  );
}