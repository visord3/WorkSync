
import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { THEME } from '../App';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
}

const Card = ({ children, style, elevation = 2 }: CardProps) => {
  return (
    <View 
      style={[
        styles.card, 
        { 
          elevation,
          shadowOpacity: 0.1 * elevation / 2, 
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.medium,
    padding: THEME.spacing.medium,
    marginVertical: THEME.spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});

export default Card;