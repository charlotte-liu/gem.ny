import * as Font from 'expo-font';
import { FontSource } from 'expo-font';

// Define the available font families
export const FONTS = {
  hankengrotesk: {
    regular: 'HankenGrotesk-Regular',
    light: 'HankenGrotesk-light',
    semiBold: 'HankenGrotesk-SemiBold',
    semiBoldItalic: 'HankenGrotesk-SemiBoldItalic',
    thin: 'HankenGrotesk-Thin',
    thinItalic: 'HankenGrotesk-ThinItalic',
    lightItalic: 'HankenGrotesk-LightItalic',
    italic: 'HankenGrotesk-Italic',
  }
};

// List of fonts to load
// Add your custom font files to /assets/fonts/ directory
export const FontsToLoad: Record<string, FontSource> = {
  'HankenGrotesk-Regular': require('../assets/fonts/HankenGrotesk-Regular.ttf'),
  'HankenGrotesk-light': require('../assets/fonts/HankenGrotesk-Light.ttf'),
  'HankenGrotesk-SemiBold': require('../assets/fonts/HankenGrotesk-SemiBold.ttf'),
  'HankenGrotesk-SemiBoldItalic': require('../assets/fonts/HankenGrotesk-SemiBoldItalic.ttf'),
  'HankenGrotesk-Thin': require('../assets/fonts/HankenGrotesk-Thin.ttf'),
  'HankenGrotesk-ThinItalic': require('../assets/fonts/HankenGrotesk-ThinItalic.ttf'),
  'HankenGrotesk-LightItalic': require('../assets/fonts/HankenGrotesk-LightItalic.ttf'),
  'HankenGrotesk-Italic': require('../assets/fonts/HankenGrotesk-Italic.ttf'),
};

// Function to load all fonts
export const loadFonts = async () => {
  try {
    await Font.loadAsync(FontsToLoad);
    console.log('Fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};