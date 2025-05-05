import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import SecureStorage from '../storage/storage';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  auth, 
  db 
} from '../firebase/firebaseconfig';
import { 
  doc, 
  getDoc
} from 'firebase/firestore';

// Define user roles
export enum UserRole {
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

// Define user interface
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  department?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for accessing auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user role and data with improved offline handling
  const getUserData = async (uid: string): Promise<{ 
    role: UserRole; 
    displayName: string | null;
    department?: string;
  }> => {
    try {
      // First try to get from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Map string role to enum
        let role: UserRole;
        switch (userData.role) {
          case 'superAdmin':
            role = UserRole.SUPER_ADMIN;
            break;
          case 'admin':
            role = UserRole.ADMIN;
            break;
          default:
            role = UserRole.EMPLOYEE;
        }
        
        // Store this data locally for offline use
        await SecureStorage.setItem(`user_data_${uid}`, JSON.stringify({
          role: userData.role,
          displayName: userData.name || null,
          department: userData.department || undefined
        }));
        
        return {
          role,
          displayName: userData.name || null,
          department: userData.department || undefined
        };
      }
      
      return { role: UserRole.EMPLOYEE, displayName: null };
    } catch (error: any) {
      console.error('Error getting user data from Firestore:', error);
      
      // If offline error, try to get cached data from SecureStorage
      if (error.code === 'unavailable' || error.message.includes('offline') || error.message.includes('Failed to get document')) {
        console.log('Attempting to load user data from local storage...');
        try {
          const cachedUserData = await SecureStorage.getItem(`user_data_${uid}`);
          if (cachedUserData) {
            const userData = JSON.parse(cachedUserData);
            let role: UserRole;
            
            switch (userData.role) {
              case 'superAdmin':
                role = UserRole.SUPER_ADMIN;
                break;
              case 'admin':
                role = UserRole.ADMIN;
                break;
              default:
                role = UserRole.EMPLOYEE;
            }
            
            console.log('Successfully loaded user data from local storage');
            return {
              role,
              displayName: userData.displayName || null,
              department: userData.department || undefined
            };
          }
        } catch (storageError) {
          console.error('Error getting cached user data:', storageError);
        }
      }
      
      // Default fallback
      return { role: UserRole.EMPLOYEE, displayName: null };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data including role
          const { role, displayName, department } = await getUserData(firebaseUser.uid);
          
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: displayName || firebaseUser.displayName,
            role,
            department
          };
          
          setUser(userData);
          
          // Store auth state in SecureStorage for offline access
          await SecureStorage.setItem('userAuthState', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName,
            role: userData.role,
            department
          }));
        } else {
          setUser(null);
          await SecureStorage.removeItem('userAuthState');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    // Try to restore session
    const restoreSession = async () => {
      try {
        const savedAuthState = await SecureStorage.getItem('userAuthState');
        if (savedAuthState && !auth.currentUser) {
          // If we have saved state but no current user,
          // we can temporarily restore from local storage
          const userData = JSON.parse(savedAuthState);
          
          // Convert string role to enum if needed
          let role: UserRole;
          if (typeof userData.role === 'string') {
            switch (userData.role) {
              case 'superAdmin':
                role = UserRole.SUPER_ADMIN;
                break;
              case 'admin':
                role = UserRole.ADMIN;
                break;
              default:
                role = UserRole.EMPLOYEE;
            }
          } else {
            role = userData.role;
          }
          
          setUser({
            uid: userData.uid,
            email: userData.email || '',
            displayName: userData.displayName || null,
            role,
            department: userData.department
          });
          
          console.log('Restored user session from local storage temporarily');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    };

    restoreSession();
    return unsubscribe;
  }, []);

  // Sign in
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data - the auth state change listener will handle setting the user
      await getUserData(userCredential.user.uid);
      
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/network-request-failed') {
        Alert.alert('Login Failed', 'Network connection unavailable. Please check your internet connection.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        Alert.alert('Login Failed', 'Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Login Failed', 'Too many unsuccessful login attempts. Please try again later.');
      } else {
        Alert.alert('Login Failed', error.message || 'An error occurred during login');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      await SecureStorage.removeItem('userAuthState');
      // Also clear any user data
      const keys = await SecureStorage.getAllKeys();
      const userDataKeys = keys.filter(key => key.startsWith('user_data_'));
      await SecureStorage.multiRemove(userDataKeys);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/network-request-failed') {
        Alert.alert('Password Reset Failed', 'Network connection unavailable. Please check your internet connection.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Password Reset Failed', 'No account found with this email address.');
      } else {
        Alert.alert('Password Reset Failed', error.message || 'Unable to send password reset email');
      }
      
      return false;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}