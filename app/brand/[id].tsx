// File: app/brand/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { H1, H2, H3, Body1, Body2, Caption, Button } from '../../components/Typography';
import { COLORS } from '../../constants/Colors';

// Attempt to import LinearGradient, but provide a fallback
let LinearGradient = ({ children, style, colors }) => (
  <View style={style}>{children}</View>
);

// Try importing LinearGradient only if it's available
try {
  const ExpoLinearGradient = require('expo-linear-gradient');
  if (ExpoLinearGradient && ExpoLinearGradient.LinearGradient) {
    LinearGradient = ExpoLinearGradient.LinearGradient;
  }
} catch (error) {
  console.warn('expo-linear-gradient not available, using fallback');
}

// Sample data for demonstration purposes
const SAMPLE_BRAND = {
  brand: "Jacquemus",
  product_name: "Le Chiquito Mini Bag",
  description: "The French label known for its unique proportions and contemporary aesthetic. Founded by Simon Porte Jacquemus, the brand has quickly become a fashion favorite for its playful designs and Instagram-worthy accessories.",
  category: "Luxury",
  trending_score: 94,
  image_url: "https://via.placeholder.com/600x800",
  link: "https://www.jacquemus.com",
  recent_mentions: [
    {
      source: "Vogue",
      text: "Jacquemus' miniature bags continue to dominate street style during Paris Fashion Week",
      date: "3 days ago"
    },
    {
      source: "Instagram",
      text: "Featured in @voguemagazine's latest '10 Accessories to Invest In' list",
      date: "1 week ago"
    },
    {
      source: "SSENSE",
      text: "New collection just dropped, featuring bold colors and miniature accessories",
      date: "2 weeks ago"
    }
  ]
};

const MentionItem = ({ mention }) => (
  <View style={styles.mentionItem}>
    <View style={styles.mentionSource}>
      <Caption style={styles.mentionSourceText}>{mention.source}</Caption>
    </View>
    <Body1 style={styles.mentionText}>"{mention.text}"</Body1>
    <Caption style={styles.mentionDate}>{mention.date}</Caption>
  </View>
);

export default function BrandDetailScreen() {
  // Get the brand ID from the URL params
  const params = useLocalSearchParams();
  const { id } = params as { id?: string };
  
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchBrandData = async () => {
      // In a real implementation, you would fetch data from your API
      // const response = await fetch(`your-api-url/brands/${id}`);
      // const data = await response.json();
      
      // For now, use sample data after a brief delay to simulate network request
      setTimeout(() => {
        setBrandData(SAMPLE_BRAND);
        setLoading(false);
      }, 800);
    };

    fetchBrandData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Body1 style={styles.loadingText}>Loading brand details...</Body1>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: brandData.image_url }} 
            style={styles.headerImage} 
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Body1 style={styles.backButtonText}>←</Body1>
          </TouchableOpacity>
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
          
          <View style={styles.brandHeaderInfo}>
            <Button style={styles.brandCategory}>{brandData.category}</Button>
            <H1 style={styles.brandName}>{brandData.brand}</H1>
            <View style={styles.trendingBadge}>
              <H2 style={styles.trendingScore}>{brandData.trending_score}</H2>
              <Caption style={styles.trendingLabel}>TREND SCORE</Caption>
            </View>
          </View>
        </View>
        
        {/* Content section */}
        <View style={styles.content}>
          <H2 style={styles.productName}>{brandData.product_name}</H2>
          <Body1 style={styles.description}>{brandData.description}</Body1>
          
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => Linking.openURL(brandData.link)}
          >
            <Button style={styles.shopButtonText}>SHOP NOW</Button>
          </TouchableOpacity>
          
          <View style={styles.sectionDivider} />
          
          <H3 style={styles.sectionTitle}>Recent Mentions</H3>
          
          {brandData.recent_mentions.map((mention, index) => (
            <MentionItem key={index} mention={mention} />
          ))}
          
          <TouchableOpacity style={styles.moreButton}>
            <Body2 style={styles.moreButtonText}>VIEW ALL MENTIONS</Body2>
          </TouchableOpacity>
          
          <View style={styles.sectionDivider} />
          
          <H3 style={styles.sectionTitle}>Similar Brands</H3>
          <View style={styles.similarBrandsContainer}>
            <TouchableOpacity style={styles.similarBrandItem}>
              <Body2 style={styles.similarBrandName}>Bottega Veneta</Body2>
            </TouchableOpacity>
            <TouchableOpacity style={styles.similarBrandItem}>
              <Body2 style={styles.similarBrandName}>Loewe</Body2>
            </TouchableOpacity>
            <TouchableOpacity style={styles.similarBrandItem}>
              <Body2 style={styles.similarBrandName}>The Row</Body2>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.text.secondary
  },
  imageContainer: {
    height: 450,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  backButtonText: {
    color: COLORS.text.white,
    fontSize: 20,
  },
  brandHeaderInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  brandCategory: {
    color: COLORS.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  brandName: {
    color: COLORS.text.white,
    marginBottom: 16,
    letterSpacing: 0.5
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  trendingScore: {
    color: COLORS.text.white,
    marginRight: 8
  },
  trendingLabel: {
    color: COLORS.text.white,
    letterSpacing: 0.5
  },
  content: {
    padding: 24,
  },
  productName: {
    color: COLORS.text.primary,
    marginBottom: 12
  },
  description: {
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: 24
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30
  },
  shopButtonText: {
    color: COLORS.text.white,
    letterSpacing: 0.5
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 30
  },
  sectionTitle: {
    color: COLORS.text.primary,
    marginBottom: 20
  },
  mentionItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  mentionSource: {
    backgroundColor: COLORS.accent2,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  mentionSourceText: {
    color: COLORS.text.white,
    letterSpacing: 0.5
  },
  mentionText: {
    color: COLORS.text.primary,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 22
  },
  mentionDate: {
    color: COLORS.text.light
  },
  moreButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  moreButtonText: {
    color: COLORS.text.secondary,
  },
  similarBrandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10
  },
  similarBrandItem: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  similarBrandName: {
    color: COLORS.text.secondary
  }
});