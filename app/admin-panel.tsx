// File: app/admin-panel.tsx
// Admin panel for managing data sources and viewing system performance

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import { Stack, router } from 'expo-router';

// Import Typography components
import { H1, H2, H3, Body1, Body2, Caption, Button } from '../components/Typography';
// Import centralized constants
import { COLORS } from '../constants/Colors';

// Import services
import { SEED_SOURCES, SourceCategory } from '../data/sources/config';
import { sourceDataService } from '../services/SourceDataService';
import { networkExpansionService } from '../services/NetworkExpansionService';
import { feedbackLoopService } from '../services/FeedbackLoopService';
import { scoringAlgorithm } from '../services/ScoringAlgorithm';

export default function AdminPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [seedSources, setSeedSources] = useState([...SEED_SOURCES]);
  const [sourcePerformance, setSourcePerformance] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [recommendedSources, setRecommendedSources] = useState([]);
  const [sourceWeightAdjustments, setSourceWeightAdjustments] = useState([]);
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Initialize network expansion and scoring
      await networkExpansionService.runFullNetworkExpansion();
      await scoringAlgorithm.initialize();
      
      // Get source performance metrics
      setSourcePerformance(feedbackLoopService.getSourcePerformance());
      
      // Get system performance metrics
      setSystemMetrics(feedbackLoopService.getSystemPerformanceMetrics());
      
      // Get recommended new sources
      setRecommendedSources(feedbackLoopService.getRecommendedNewSources(5));
      
      // Get source weight adjustment recommendations
      setSourceWeightAdjustments(feedbackLoopService.getRecommendedSourceWeights());
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load admin data.');
    }
  };
  
  // Update source weight
  const updateSourceWeight = (sourceId, newWeight) => {
    const updatedSources = seedSources.map(source => {
      if (source.id === sourceId) {
        return { ...source, weight: newWeight };
      }
      return source;
    });
    
    setSeedSources(updatedSources);
    
    // In a real app, this would persist the changes to the config
    Alert.alert('Update', `Updated ${sourceId} weight to ${newWeight}%`);
  };
  
  // Apply recommended weight adjustments
  const applyRecommendedWeights = () => {
    const updatedSources = [...seedSources];
    
    sourceWeightAdjustments.forEach(adjustment => {
      const sourceIndex = updatedSources.findIndex(s => s.id === adjustment.sourceId);
      if (sourceIndex >= 0) {
        updatedSources[sourceIndex] = {
          ...updatedSources[sourceIndex],
          weight: adjustment.recommendedWeight
        };
      }
    });
    
    setSeedSources(updatedSources);
    setSourceWeightAdjustments([]);
    
    // In a real app, this would persist the changes to the config
    Alert.alert('Updated', 'Applied recommended weight adjustments to all sources.');
  };
  
  // Add a new source
  const addNewSource = (discoveredSource) => {
    // Create a new seed source from the discovered source
    const newSource = {
      id: discoveredSource.name.toLowerCase().replace(/\s+/g, '-'),
      name: discoveredSource.name,
      url: discoveredSource.url,
      category: discoveredSource.category || SourceCategory.EDITORIAL,
      weight: 5, // Start with a small weight
      selectors: {
        articles: '.article',
        brands: '.brand',
        products: '.product'
      }
    };
    
    const updatedSources = [...seedSources, newSource];
    setSeedSources(updatedSources);
    
    // Remove from recommended sources
    setRecommendedSources(recommendedSources.filter(s => s.url !== discoveredSource.url));
    
    // In a real app, this would persist the changes to the config
    Alert.alert('Added', `Added ${discoveredSource.name} to seed sources.`);
  };
  
  // Run data refresh
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await sourceDataService.fetchAllSources();
      setIsLoading(false);
      Alert.alert('Success', 'Data refresh complete.');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to refresh data.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Stack.Screen 
        options={{ 
          title: 'Admin Panel',
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <H1 style={styles.title}>Trend Discovery Admin</H1>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Body1 style={styles.loading}>Loading admin data...</Body1>
          </View>
        ) : (
          <>
            {/* System Performance */}
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>System Performance</H2>
              
              {systemMetrics && (
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Caption style={styles.metricLabel}>ACCURACY</Caption>
                    <H3 style={styles.metricValue}>{systemMetrics.trendAccuracy.toFixed(1)}%</H3>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Caption style={styles.metricLabel}>SOURCES</Caption>
                    <H3 style={styles.metricValue}>{seedSources.length}</H3>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <Caption style={styles.metricLabel}>FEEDBACK</Caption>
                    <H3 style={styles.metricValue}>{systemMetrics.feedbackCount}</H3>
                  </View>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={refreshData}
              >
                <Button style={styles.actionButtonText}>REFRESH DATA</Button>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={loadData}
              >
                <Button style={styles.secondaryButtonText}>RELOAD ADMIN DATA</Button>
              </TouchableOpacity>
            </View>
            
            {/* Seed Sources */}
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Seed Sources</H2>
              <Body1 style={styles.sectionDescription}>
                Manage your seed sources and their weights
              </Body1>
              
              {seedSources.map((source, index) => {
                // Find performance metrics for this source
                const performance = sourcePerformance.find(p => p.sourceId === source.id);
                
                return (
                  <View key={source.id} style={styles.sourceItem}>
                    <View style={styles.sourceHeader}>
                      <H3 style={styles.sourceName}>{source.name}</H3>
                      <Caption style={styles.sourceCategory}>{source.category}</Caption>
                    </View>
                    
                    <Body2 style={styles.sourceUrl}>{source.url}</Body2>
                    
                    {performance && (
                      <View style={styles.performanceContainer}>
                        <View style={styles.performanceItem}>
                          <Caption style={styles.performanceLabel}>ACCURACY</Caption>
                          <Body2 style={[
                            styles.performanceValue,
                            performance.predictiveAccuracy > 70 ? styles.goodValue : 
                            performance.predictiveAccuracy < 40 ? styles.badValue : null
                          ]}>
                            {performance.predictiveAccuracy.toFixed(1)}%
                          </Body2>
                        </View>
                        
                        <View style={styles.performanceItem}>
                          <Caption style={styles.performanceLabel}>SCORE</Caption>
                          <Body2 style={[
                            styles.performanceValue,
                            performance.overallScore > 70 ? styles.goodValue : 
                            performance.overallScore < 40 ? styles.badValue : null
                          ]}>
                            {performance.overallScore.toFixed(1)}
                          </Body2>
                        </View>
                        
                        <View style={styles.performanceItem}>
                          <Caption style={styles.performanceLabel}>FALSE +</Caption>
                          <Body2 style={[
                            styles.performanceValue,
                            performance.falsePositiveRate < 0.2 ? styles.goodValue : 
                            performance.falsePositiveRate > 0.5 ? styles.badValue : null
                          ]}>
                            {(performance.falsePositiveRate * 100).toFixed(1)}%
                          </Body2>
                        </View>
                      </View>
                    )}
                    
                    <View style={styles.weightContainer}>
                      <Caption style={styles.weightLabel}>WEIGHT</Caption>
                      <View style={styles.weightControls}>
                        <TouchableOpacity
                          style={styles.weightButton}
                          onPress={() => updateSourceWeight(
                            source.id, 
                            Math.max(source.weight - 5, 5)
                          )}
                        >
                          <Body1 style={styles.weightButtonText}>-</Body1>
                        </TouchableOpacity>
                        
                        <H3 style={styles.weightValue}>{source.weight}%</H3>
                        
                        <TouchableOpacity
                          style={styles.weightButton}
                          onPress={() => updateSourceWeight(
                            source.id, 
                            Math.min(source.weight + 5, 50)
                          )}
                        >
                          <Body1 style={styles.weightButtonText}>+</Body1>
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* Weight adjustment recommendation */}
                    {sourceWeightAdjustments.some(adj => adj.sourceId === source.id) && (
                      <View style={styles.recommendation}>
                        <Caption style={styles.recommendationLabel}>RECOMMENDED</Caption>
                        <Body2 style={styles.recommendationText}>
                          Adjust weight to {
                            sourceWeightAdjustments.find(adj => adj.sourceId === source.id).recommendedWeight
                          }%
                        </Body2>
                      </View>
                    )}
                  </View>
                );
              })}
              
              {sourceWeightAdjustments.length > 0 && (
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={applyRecommendedWeights}
                >
                  <Button style={styles.applyButtonText}>
                    APPLY ALL RECOMMENDED WEIGHTS
                  </Button>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Recommended New Sources */}
            {recommendedSources.length > 0 && (
              <View style={styles.section}>
                <H2 style={styles.sectionTitle}>Recommended New Sources</H2>
                <Body1 style={styles.sectionDescription}>
                  Discovered sources that may improve your trend detection
                </Body1>
                
                {recommendedSources.map(source => (
                  <View key={source.url} style={styles.recommendedSource}>
                    <View style={styles.recommendedHeader}>
                      <H3 style={styles.recommendedName}>{source.name}</H3>
                      <Caption style={styles.recommendedMethod}>
                        via {source.discoveryMethod}
                      </Caption>
                    </View>
                    
                    <Body2 style={styles.recommendedUrl}>{source.url}</Body2>
                    
                    <View style={styles.connectionContainer}>
                      <Caption style={styles.connectionLabel}>
                        CONNECTIONS TO SEED SOURCES
                      </Caption>
                      <View style={styles.connectionList}>
                        {source.seedConnections.map((connection, idx) => {
                          const seedSource = seedSources.find(s => s.id === connection.sourceId);
                          return (
                            <View key={idx} style={styles.connectionItem}>
                              <Body2 style={styles.connectionName}>
                                {seedSource ? seedSource.name : connection.sourceId}
                              </Body2>
                              <Body2 style={styles.connectionStrength}>
                                {connection.strength}%
                              </Body2>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    
                    <View style={styles.sourceStats}>
                      <View style={styles.statItem}>
                        <Caption style={styles.statLabel}>AUTHORITY</Caption>
                        <Body2 style={styles.statValue}>{source.estimatedAuthority}%</Body2>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Caption style={styles.statLabel}>DISCOVERED</Caption>
                        <Body2 style={styles.statValue}>
                          {source.discoveredAt.toLocaleDateString()}
                        </Body2>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.addSourceButton}
                      onPress={() => addNewSource(source)}
                    >
                      <Button style={styles.addSourceButtonText}>
                        ADD TO SEED SOURCES
                      </Button>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Scoring Algorithm Parameters */}
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Scoring Algorithm</H2>
              <Body1 style={styles.sectionDescription}>
                Current parameters for the brand trend scoring algorithm
              </Body1>
              
              {systemMetrics && systemMetrics.scoringParameters && (
                <View style={styles.parametersContainer}>
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Source Weight Factor</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.sourceWeightFactor.toFixed(2)}
                    </Body2>
                  </View>
                  
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Centrality Factor</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.centralityFactor.toFixed(2)}
                    </Body2>
                  </View>
                  
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Recency Factor</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.recencyFactor.toFixed(2)}
                    </Body2>
                  </View>
                  
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Recency Decay (Days)</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.recencyDecayDays}
                    </Body2>
                  </View>
                  
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Sentiment Factor</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.sentimentFactor.toFixed(2)}
                    </Body2>
                  </View>
                  
                  <View style={styles.parameterItem}>
                    <Caption style={styles.parameterLabel}>Product Mention Boost</Caption>
                    <Body2 style={styles.parameterValue}>
                      {systemMetrics.scoringParameters.productMentionBoost.toFixed(2)}x
                    </Body2>
                  </View>
                </View>
              )}
              
              <Body2 style={styles.algorithmNote}>
                These parameters are automatically adjusted based on user feedback and source performance.
                The feedback loop continuously optimizes the algorithm for better trend prediction.
              </Body2>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    marginBottom: 20,
    color: COLORS.text.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loading: {
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    marginBottom: 12,
    color: COLORS.text.primary,
  },
  sectionDescription: {
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.primary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: COLORS.text.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
  },
  sourceItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceName: {
    color: COLORS.text.primary,
  },
  sourceCategory: {
    color: COLORS.text.secondary,
    backgroundColor: COLORS.accent2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sourceUrl: {
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    color: COLORS.text.light,
    marginBottom: 4,
  },
  performanceValue: {
    color: COLORS.text.primary,
  },
  goodValue: {
    color: '#4CAF50',
  },
  badValue: {
    color: '#F44336',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weightLabel: {
    color: COLORS.text.secondary,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightButtonText: {
    color: COLORS.text.white,
    fontSize: 18,
  },
  weightValue: {
    marginHorizontal: 16,
    color: COLORS.text.primary,
    minWidth: 50,
    textAlign: 'center',
  },
  recommendation: {
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  recommendationLabel: {
    color: COLORS.text.white,
    marginBottom: 4,
  },
  recommendationText: {
    color: COLORS.text.white,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: COLORS.text.white,
  },
  recommendedSource: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedName: {
    color: COLORS.text.primary,
  },
  recommendedMethod: {
    color: COLORS.accent,
  },
  recommendedUrl: {
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  connectionContainer: {
    marginBottom: 16,
  },
  connectionLabel: {
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  connectionList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  connectionName: {
    color: COLORS.text.primary,
  },
  connectionStrength: {
    color: COLORS.primary,
  },
  sourceStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statLabel: {
    color: COLORS.text.light,
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.text.primary,
  },
  addSourceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addSourceButtonText: {
    color: COLORS.text.white,
  },
  parametersContainer: {
    marginBottom: 16,
  },
  parameterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  parameterLabel: {
    color: COLORS.text.secondary,
  },
  parameterValue: {
    color: COLORS.text.primary,
  },
  algorithmNote: {
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  }
});