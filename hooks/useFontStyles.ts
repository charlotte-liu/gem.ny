// File: hooks/useFontStyles.ts
import { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { FONTS } from '../constants/Fonts';
import { TextVariant, TypographyStyle } from '../types/typography';
import { COLORS } from '../constants/Colors';

export const useFontStyles = () => {
  // Define the typography styles for each text variant
  const styles = useMemo(() => {
    return StyleSheet.create({
      h1: {
        fontFamily: FONTS.hankengrotesk.light,
        fontSize: 28,
        lineHeight: 38,
        letterSpacing: 0.75,
        color: COLORS.text.primary,
      },
      h2: {
        fontFamily: FONTS.hankengrotesk.light,
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 0.5,
        color: COLORS.text.primary,
      },
      h3: {
        fontFamily: FONTS.hankengrotesk.semiBold,
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 0.15,
        color: COLORS.text.primary,
      },
      subtitle1: {
        fontFamily: FONTS.hankengrotesk.regular,
        fontSize: 20,
        lineHeight: 28,
        letterSpacing: 0.15,
        color: COLORS.text.primary,
      },
      subtitle2: {
        fontFamily: FONTS.hankengrotesk.regular,
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.1,
        color: COLORS.text.primary,
      },
      body1: {
        fontFamily: FONTS.hankengrotesk.light,
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.9,
        color: COLORS.text.secondary,
      },
      body2: {
        fontFamily: FONTS.hankengrotesk.light,
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.9,
        color: COLORS.text.secondary,
      },
      button: {
        fontFamily: FONTS.hankengrotesk.semiBold,
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 2.25,
        textTransform: 'uppercase',
        color: COLORS.text.white,
      },
      caption: {
        fontFamily: FONTS.hankengrotesk.light,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.4,
        color: COLORS.text.secondary,
      },
      overline: {
        fontFamily: FONTS.hankengrotesk.regular,
        fontSize: 10,
        lineHeight: 16,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: COLORS.text.light,
      },
    });
  }, []);

  // Function to get style for a specific variant
  const getTextStyle = (variant: TextVariant): TypographyStyle => {
    return styles[variant] as TypographyStyle;
  };

  return { styles, getTextStyle };
};