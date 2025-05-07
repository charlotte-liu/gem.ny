import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFonts } from '../constants/Fonts';

// Define the context type
type FontContextType = {
  fontsLoaded: boolean;
  fontError: Error | null;
};

// Create the context with default values
const FontContext = createContext<FontContextType>({
  fontsLoaded: false,
  fontError: null,
});

// Hook for consuming the font context
export const useFonts = () => useContext(FontContext);

// Provider component
export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAppFonts = async () => {
      try {
        const success = await loadFonts();
        setFontsLoaded(success);
      } catch (error) {
        setFontError(error instanceof Error ? error : new Error('Unknown font loading error'));
        console.error('Failed to load fonts:', error);
      }
    };

    loadAppFonts();
  }, []);

  const value = {
    fontsLoaded,
    fontError,
  };

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};