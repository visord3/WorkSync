// screens/logInPage.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../services/auth/auth.service';
import { THEME } from '../App';
import Container from '../components/container';
import Input from '../components/input';
import Button from '../components/Button';
import Card from '../components/card';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, loading, resetPassword } = useAuth();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const success = await signIn(email, password);
    if (!success) {
      // Error is handled in the signIn method with an alert
      console.log('Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address to reset password');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    }
  };

  return (
    <Container scroll keyboardAvoiding padding={false}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>WorkSync</Text>
        <Text style={styles.tagline}>Streamline your workforce management</Text>
      </View>
      
      <Card style={styles.loginCard}>
        <Text style={styles.title}>Sign In</Text>
        
        <Input
          label="Email"
          placeholder="example@company.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
          error={passwordError}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />

        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordButton}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          style={styles.loginButton}
        />
      </Card>
            
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 WorkSync. All rights reserved.
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: THEME.spacing.xlarge * 2,
    marginBottom: THEME.spacing.xlarge,
    paddingHorizontal: THEME.spacing.large,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: THEME.spacing.medium,
  },
  appName: {
    fontSize: THEME.fontSize.xxlarge,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.small,
  },
  tagline: {
    fontSize: THEME.fontSize.medium,
    color: THEME.colors.textLight,
    textAlign: 'center',
  },
  loginCard: {
    marginHorizontal: THEME.spacing.large,
    marginBottom: THEME.spacing.xlarge,
    padding: THEME.spacing.large,
  },
  title: {
    fontSize: THEME.fontSize.xlarge,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.large,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.medium,
  },
  forgotPasswordText: {
    color: THEME.colors.primary,
    fontSize: THEME.fontSize.medium,
  },
  loginButton: {
    marginTop: THEME.spacing.small,
  },
  footer: {
    padding: THEME.spacing.medium,
    alignItems: 'center',
  },
  footerText: {
    color: THEME.colors.textLight,
    fontSize: THEME.fontSize.small,
  },
});

export default LoginScreen;