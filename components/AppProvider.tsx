// File: components/AppProvider.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FontProvider, useFonts } from '../contexts/FontContext';
import { COLORS } from '../constants/Colors';

// Loading screen component while fonts are loading
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <ActivityIndicator size="large" color={COLORS.accent} />
    <Text style={{ marginTop: 10, color: COLORS.text.secondary }}>Loading fonts...</Text>
  </View>
);

// FontAwesome component that displays content only after fonts are loaded
const FontAwaitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fontsLoaded, fontError } = useFonts();
  
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }
  
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }
  
  return <>{children}</>;
};

// Wrapper component that provides all context providers
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FontProvider>
      <FontAwaitProvider>
        {children}
      </FontAwaitProvider>
    </FontProvider>
  );
};

export default AppProvider;