// File: app/AppNavigator.tsx
import { Slot } from 'expo-router';
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FontProvider, useFonts } from '../contexts/FontContext';
import { COLORS } from '../constants/Colors';

// FontAwareApp component that checks if fonts are loaded
const FontAwareApp = ({ children }: { children: React.ReactNode }) => {
  const { fontsLoaded, fontError } = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.text.secondary }}>
          Loading app fonts...
        </Text>
      </View>
    );
  }

  if (fontError) {
    console.warn('Font loading error:', fontError);
    // Continue anyway even if there's an error loading fonts
  }

  return <>{children}</>;
};

export default function AppNavigator() {
  return (
    <FontProvider>
      <FontAwareApp>
        <Slot />
      </FontAwareApp>
    </FontProvider>
  );
}