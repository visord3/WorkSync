import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming you're using Firebase
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth} from '../firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

// Define user roles
export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'superAdmin',
  EMPLOYEE = 'employee'
}

// Define home routes for each role
export const ROLE_HOME_ROUTES = {
  [UserRole.ADMIN]: '/tabs/admin',
  [UserRole.SUPER_ADMIN]: '/tabs/superAdmin',
  [UserRole.EMPLOYEE]: '/tabs/employee'
};

// Define types
type User = {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  department?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  getHomeRouteForUser: (user: User) => string;
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
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Get user role and data
  const getUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Determine role based on userData
        let role = UserRole.EMPLOYEE; // Default role
        
        if (userData.role === 'superAdmin') {
          role = UserRole.SUPER_ADMIN;
        } else if (userData.role === 'admin') {
          role = UserRole.ADMIN;
        }
        
        return {
          role,
          displayName: userData.displayName || null,
          department: userData.department || undefined
        };
      }
      return { role: UserRole.EMPLOYEE, displayName: null };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { role: UserRole.EMPLOYEE, displayName: null };
    }
  };

  // Get home route for user based on role
  const getHomeRouteForUser = (user: User): string => {
    if (!user) return '/login';
    return ROLE_HOME_ROUTES[user.role] || '/login';
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data including role
          const { role, displayName, department } = await getUserData(firebaseUser.uid);
          
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: displayName || firebaseUser.displayName,
            role,
            department
          };
          
          setUser(userData);
          
          // Store auth state in AsyncStorage
          await AsyncStorage.setItem('userAuthState', JSON.stringify({
            uid: firebaseUser.uid,
            role
          }));
        } else {
          setUser(null);
          await AsyncStorage.removeItem('userAuthState');
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
        const savedAuthState = await AsyncStorage.getItem('userAuthState');
        if (savedAuthState && !auth.currentUser) {
          // If we have saved state but no current user,
          // we'll wait for onAuthStateChanged to handle it
          console.log('Found saved auth state, waiting for Firebase auth...');
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
      
      // Get user data including role
      const userData = await getUserData(userCredential.user.uid);
      
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
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
      await AsyncStorage.removeItem('userAuthState');
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
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    getHomeRouteForUser
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}