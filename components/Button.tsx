import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { THEME } from '../App';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle,
  fullWidth = false
}: ButtonProps) => {
  // Determine button colors based on type
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return { backgroundColor: THEME.colors.secondary };
      case 'danger':
        return { backgroundColor: THEME.colors.danger };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: THEME.colors.primary
        };
      default:
        return { backgroundColor: THEME.colors.primary };
    }
  };

  // Determine text color based on type
  const getTextStyle = () => {
    switch (type) {
      case 'outline':
        return { color: THEME.colors.primary };
      default:
        return { color: '#FFFFFF' };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={type === 'outline' ? THEME.colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: THEME.spacing.medium,
    borderRadius: THEME.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
  },
  text: {
    fontWeight: '600',
    fontSize: THEME.fontSize.medium,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;