// File: components/Typography.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { useFontStyles } from '../hooks/useFontStyles';
import { TextVariant, TextAlignment, TypographyProps } from '../types/typography';

const Typography: React.FC<TypographyProps & TextProps> = ({
  variant = 'body1',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { getTextStyle } = useFontStyles();
  
  const textStyle = getTextStyle(variant);
  
  const combinedStyle = [
    textStyle,
    color ? { color } : null,
    align ? { textAlign: align } : null,
    style, // Allow custom style overrides
  ];
  
  return <Text style={combinedStyle} {...props}>{children}</Text>;
};

// Export convenience components for common text variants
export const H1: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="h1" {...props} />;

export const H2: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="h2" {...props} />;

export const H3: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="h3" {...props} />;

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="subtitle1" {...props} />;

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="subtitle2" {...props} />;

export const Body1: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="body1" {...props} />;

export const Body2: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="body2" {...props} />;

export const Button: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="button" {...props} />;

export const Caption: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="caption" {...props} />;

export const Overline: React.FC<Omit<TypographyProps, 'variant'> & TextProps> = (props) => 
  <Typography variant="overline" {...props} />;

export default Typography;