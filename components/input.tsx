// Fixed components/input.tsx
import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { THEME } from '../App';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const Input = ({ 
  label, 
  error, 
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...rest
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput 
        style={[
          styles.input, 
          inputStyle,
          error ? styles.inputError : undefined 
        ]}
        placeholderTextColor={THEME.colors.textLight}
        {...rest}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.medium,
  },
  label: {
    fontSize: THEME.fontSize.medium,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.small,
    padding: THEME.spacing.medium,
    fontSize: THEME.fontSize.medium,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.cardBackground,
  },
  inputError: {
    borderColor: THEME.colors.danger,
  },
  error: {
    color: THEME.colors.danger,
    fontSize: THEME.fontSize.small,
    marginTop: THEME.spacing.xs,
  },
});

export default Input;