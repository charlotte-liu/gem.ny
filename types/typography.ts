// File: types/typography.ts
// Type definitions for the typography system
import { TextStyle } from 'react-native';

export type FontWeight = 
  | 'regular'
  | 'light'
  | 'semiBold'
  | 'thin';

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2' 
  | 'button' 
  | 'caption' 
  | 'overline';

export type TextAlignment = 'auto' | 'left' | 'right' | 'center' | 'justify';

export type TypographyProps = {
  variant?: TextVariant;
  color?: string;
  align?: TextAlignment;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
};

export interface TypographyStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
}