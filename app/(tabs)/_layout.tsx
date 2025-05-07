// File: app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { FONTS } from '../../constants/Fonts';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: FONTS.hankengrotesk.regular,
          fontSize: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Welcome',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Trends',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="line-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}