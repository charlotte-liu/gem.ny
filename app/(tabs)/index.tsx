// File: app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground
} from 'react-native';
import { router } from 'expo-router';
import { H1, H2, Body1, Body2, Button } from '../../components/Typography';
import { COLORS } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation?: any;
};

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.background}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <H2 style={styles.logoText}>GEM.NY</H2>
            <View style={styles.logoAccent}></View>
          </View>
          
          <H1 style={styles.title}>discover fashion's next wave</H1>
          <Body1 style={styles.subtitle}>
            find out in real time from the people of new york what's good.
          </Body1>
          
          <View style={styles.featureContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Body1 style={styles.featureIconText}>↗</Body1>
              </View>
              <View style={styles.featureTextContainer}>
                <H2 style={styles.featureTitle}>trend analysis</H2>
                <Body2 style={styles.featureDescription}>
                  real-time data from social media, fashion publications, and retail platforms
                </Body2>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Body1 style={styles.featureIconText}>♡</Body1>
              </View>
              <View style={styles.featureTextContainer}>
                <H2 style={styles.featureTitle}>curated content</H2>
                <Body2 style={styles.featureDescription}>
                  personalized fashion recommendations, aesthetics first
                </Body2>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/home')}
          >
            <Button style={styles.buttonText}>GET STARTED</Button>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {}} // For future implementation (e.g., sign in)
          >
            <Button style={styles.secondaryButtonText}>SIGN IN</Button>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: COLORS.primary,
    letterSpacing: 3,
  },
  logoAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 4,
  },
  title: {
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  subtitle: {
    color: COLORS.text.secondary,
    marginBottom: 40,
  },
  featureContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    color: COLORS.background,
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    color: COLORS.text.secondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.background,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
  },
});