// File: app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../components/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="brand/[id]" 
          options={{ 
            title: "Brand Details",
            presentation: "card"
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AppProvider>
  );
}