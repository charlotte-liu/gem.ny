// File: app/(tabs)/home-with-real-data.tsx
// Example of how to integrate real data with the existing UI

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Linking,
  TouchableOpacity, 
  Animated,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';

// Import Typography components
import { H1, H2, Body1, Body2, Caption, Button } from '../../components/Typography';
// Import centralized constants
import { COLORS } from '../../constants/Colors';
import { FONTS } from '../../constants/Fonts';

// Import trend service
import { trendService } from '../../services/TrendService';
import { TrendingBrandViewModel } from '../../types/models';
import { sourceDataService } from '../../services/SourceDataService';
import { SEED_SOURCES, SourceCategory } from '../../data/sources/config';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'streetwear', name: 'Streetwear' },
  { id: 'sustainable', name: 'Sustainable' },
  { id: 'emerging', name: 'Emerging' }
];

const BrandLabel = ({ text }: { text: string }) => (
  <View style={styles.brandLabel}>
    <Button style={styles.brandLabelText}>{text}</Button>
  </View>
);

type AnimatedCardProps = {
  item: TrendingBrandViewModel;
  index: number;
};

const AnimatedCard = ({ item, index }: AnimatedCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[
      styles.card, 
      { 
        opacity: fadeAnim, 
        transform: [{ 
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })
        }] 
      }
    ]}>
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={() => router.push(`/brand/${item.id}`)}
      >
        <View style={styles.cardInner}>
          {item.image_url ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.image} 
              />
              <BrandLabel text={item.brand} />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.noImageContainer]}>
              <Caption style={styles.noImageText}>{item.brand.charAt(0)}</Caption>
              <BrandLabel text={item.brand} />
            </View>
          )}
          
          <View style={styles.cardContent}>
            <H2 style={styles.product} numberOfLines={2}>{item.product_name}</H2>
            <Body1 style={styles.context} numberOfLines={2}>{item.context}</Body1>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.link}
                onPress={() => item.link ? Linking.openURL(item.link) : null}
              >
                <Button style={styles.linkText}>VIEW DETAILS</Button>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [brands, setBrands] = useState<TrendingBrandViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sourceInfo, setSourceInfo] = useState<string>('');

  // Filter brands based on selected category
  const filteredBrands = selectedCategory === 'all' 
    ? brands 
    : brands.filter(item => item.category === selectedCategory);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Use the trend service to get trending brands
      const trendingBrands = trendService.getTrendingBrandsForDisplay(10, selectedCategory);
      setBrands(trendingBrands);
      
      // Get source info for debugging
      const sourceStats = sourceDataService.getSourceStats();
      const totalMentions = sourceStats.reduce((sum, stat) => sum + stat.totalBrandMentions, 0);
      setSourceInfo(`Sources: ${SEED_SOURCES.length}, Mentions: ${totalMentions}`);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch brands', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBrands();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBrands();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <H2 style={styles.logoText}>TREND</H2>
            <View style={styles.logoAccent}></View>
          </View>
          <H1 style={styles.title}>Trending Brands</H1>
          <Body1 style={styles.subtitle}>Discover what's hot in fashion right now</Body1>
          <Caption style={styles.sourceInfo}>{sourceInfo}</Caption>
        </View>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Body2 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}
              >
                {category.name}
              </Body2>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Body1 style={styles.loading}>Discovering trends...</Body1>
          </View>
        ) : filteredBrands.length > 0 ? (
          filteredBrands.map((item, index) => (
            <AnimatedCard key={item.id} item={item} index={index} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Body1 style={styles.noData}>No trending brands found</Body1>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchBrands}
            >
              <Button style={styles.refreshButtonText}>Refresh</Button>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Caption style={styles.footerText}>Data from {SEED_SOURCES.length} fashion sources</Caption>
        </View>
      </ScrollView>
    </View>
  );
}.id)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerContent: {
    paddingTop: 12,
  },
  title: {
    marginBottom: 8,
    letterSpacing: 0.2,
    color: COLORS.text.primary
  },
  subtitle: {
    marginBottom: 8,
    color: COLORS.text.secondary,
  },
  sourceInfo: {
    color: COLORS.text.light,
    marginBottom: 4
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden'
  },
  cardInner: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  cardContent: {
    padding: 20
  },
  brandLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6
  },
  brandLabelText: {
    color: COLORS.text.white,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  context: {
    marginTop: 4,
    color: COLORS.text.secondary,
  },
  product: {
    marginBottom: 8,
    color: COLORS.text.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'flex-end'
  },
  link: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  linkText: {
    color: COLORS.text.white,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  logoContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    letterSpacing: 3,
    color: COLORS.primary,
  },
  logoAccent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 4,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    color: COLORS.text.secondary,
  },
  categoryButtonTextActive: {
    color: COLORS.text.white,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#1565C0'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1565C0'
  },
  noImageText: {
    fontSize: 60,
    color: COLORS.text.light
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  loading: {
    textAlign: 'center',
    marginTop: 16,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  noData: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.text.secondary,
  },
  refreshButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  refreshButtonText: {
    color: COLORS.text.white,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center'
  },
  footerText: {
    color: COLORS.text.light,
  }
});// File: app/(tabs)/home-with-real-data.tsx
// Example of how to integrate real data with the existing UI

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Linking,
  TouchableOpacity, 
  Animated,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';

// Import Typography components
import { H1, H2, Body1, Body2, Caption, Button } from '../../components/Typography';
// Import centralized constants
import { COLORS } from '../../constants/Colors';
import { FONTS } from '../../constants/Fonts';

// Import trend service
import { trendService } from '../../services/TrendService';
import { TrendingBrandViewModel } from '../../types/models';
import { sourceDataService } from '../../services/SourceDataService';
import { SEED_SOURCES, SourceCategory } from '../../data/sources/config';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'streetwear', name: 'Streetwear' },
  { id: 'sustainable', name: 'Sustainable' },
  { id: 'emerging', name: 'Emerging' }
];

const BrandLabel = ({ text }: { text: string }) => (
  <View style={styles.brandLabel}>
    <Button style={styles.brandLabelText}>{text}</Button>
  </View>
);

type AnimatedCardProps = {
  item: TrendingBrandViewModel;
  index: number;
};

const AnimatedCard = ({ item, index }: AnimatedCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[
      styles.card, 
      { 
        opacity: fadeAnim, 
        transform: [{ 
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })
        }] 
      }
    ]}>
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={() => router.push(`/brand/${item.id}`)}
      >
        <View style={styles.cardInner}>
          {item.image_url ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.image} 
              />
              <BrandLabel text={item.brand} />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.noImageContainer]}>
              <Caption style={styles.noImageText}>{item.brand.charAt(0)}</Caption>
              <BrandLabel text={item.brand} />
            </View>
          )}
          
          <View style={styles.cardContent}>
            <H2 style={styles.product} numberOfLines={2}>{item.product_name}</H2>
            <Body1 style={styles.context} numberOfLines={2}>{item.context}</Body1>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.link}
                onPress={() => item.link ? Linking.openURL(item.link) : null}
              >
                <Button style={styles.linkText}>VIEW DETAILS</Button>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [brands, setBrands] = useState<TrendingBrandViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sourceInfo, setSourceInfo] = useState<string>('');

  // Filter brands based on selected category
  const filteredBrands = selectedCategory === 'all' 
    ? brands 
    : brands.filter(item => item.category === selectedCategory);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Use the trend service to get trending brands
      const trendingBrands = trendService.getTrendingBrandsForDisplay(10, selectedCategory);
      setBrands(trendingBrands);
      
      // Get source info for debugging
      const sourceStats = sourceDataService.getSourceStats();
      const totalMentions = sourceStats.reduce((sum, stat) => sum + stat.totalBrandMentions, 0);
      setSourceInfo(`Sources: ${SEED_SOURCES.length}, Mentions: ${totalMentions}`);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch brands', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBrands();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBrands();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <H2 style={styles.logoText}>TREND</H2>
            <View style={styles.logoAccent}></View>
          </View>
          <H1 style={styles.title}>Trending Brands</H1>
          <Body1 style={styles.subtitle}>Discover what's hot in fashion right now</Body1>
          <Caption style={styles.sourceInfo}>{sourceInfo}</Caption>
        </View>
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)