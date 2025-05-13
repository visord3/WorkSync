import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleProp,
  ViewStyle
} from 'react-native';
import { THEME } from '../App';

interface ContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  padding?: boolean;
}

const Container = ({ 
  children, 
  style, 
  scroll = false, 
  keyboardAvoiding = true,
  padding = true 
}: ContainerProps) => {
  const content = (
    <View style={[
      styles.container, 
      padding && styles.padding,
      style
    ]}>
      {children}
    </View>
  );

  let rendered = content;

  if (scroll) {
    rendered = (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          {rendered}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {rendered}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  padding: {
    padding: THEME.spacing.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default Container;