// services/FeedbackLoopService.ts
// Service to implement feedback loops for improving trend detection

import { SEED_SOURCES, SeedSource } from '../data/sources/config';
import { networkExpansionService, DiscoveredSource } from './NetworkExpansionService';
import { scoringAlgorithm } from './ScoringAlgorithm';
import { sourceDataService } from './SourceDataService';

// User feedback on a brand trend
export interface BrandFeedback {
  brandName: string;
  userRating: number;      // 1-5 user rating
  comment?: string;        // Optional user comment
  timestamp: Date;         // When feedback was provided
}

// Source performance metrics
export interface SourcePerformance {
  sourceId: string;
  predictiveAccuracy: number;  // 0-100 accuracy in predicting trends
  trendLeadTime: number;       // Average days ahead of trend peak
  userFeedbackScore: number;   // 0-100 score based on user feedback
  falsePositiveRate: number;   // Rate of false positives (0-1)
  overallScore: number;        // Combined performance score (0-100)
}

export class FeedbackLoopService {
  private brandFeedback: BrandFeedback[] = [];
  private sourcePerformance: Map<string, SourcePerformance> = new Map();
  
  // Initialize with empty performance records for all sources
  constructor() {
    SEED_SOURCES.forEach(source => {
      this.sourcePerformance.set(source.id, {
        sourceId: source.id,
        predictiveAccuracy: 50, // Start at neutral (50%)
        trendLeadTime: 0,
        userFeedbackScore: 50,  // Start at neutral (50%)
        falsePositiveRate: 0,
        overallScore: 50        // Start at neutral (50%)
      });
    });
  }
  
  /**
   * Record user feedback on a brand trend
   */
  recordBrandFeedback(feedback: BrandFeedback): void {
    this.brandFeedback.push(feedback);
    
    // Update source performance based on this feedback
    this.updateSourcePerformanceFromFeedback(feedback);
  }
  
  /**
   * Update source performance metrics based on user feedback
   */
  private updateSourcePerformanceFromFeedback(feedback: BrandFeedback): void {
    // Get mentions for this brand
    const mentions = sourceDataService.getBrandMentionsByBrand(feedback.brandName);
    
    // Group mentions by source
    const mentionsBySource = new Map<string, number>();
    mentions.forEach(mention => {
      const count = mentionsBySource.get(mention.sourceId) || 0;
      mentionsBySource.set(mention.sourceId, count + 1);
    });
    
    // Update performance for each source that mentioned this brand
    mentionsBySource.forEach((mentionCount, sourceId) => {
      const performance = this.sourcePerformance.get(sourceId);
      if (!performance) return;
      
      // Skip if too few mentions (unreliable for feedback)
      if (mentionCount < 2) return;
      
      // Convert 1-5 rating to 0-100 scale
      const ratingScore = (feedback.userRating - 1) * 25;
      
      // How accurate was this source for this trend?
      // If user rating is 4-5, the source was accurate (trend was real)
      // If user rating is 1-2, the source was inaccurate (false trend)
      if (feedback.userRating >= 4) {
        // True positive - source correctly identified a trend
        performance.predictiveAccuracy = 
          (performance.predictiveAccuracy * 0.9) + (100 * 0.1); // Increase accuracy
        performance.falsePositiveRate = 
          performance.falsePositiveRate * 0.9; // Decrease false positive rate
      } else if (feedback.userRating <= 2) {
        // False positive - source identified a non-trend
        performance.predictiveAccuracy = 
          (performance.predictiveAccuracy * 0.9) + (0 * 0.1); // Decrease accuracy
        performance.falsePositiveRate = 
          (performance.falsePositiveRate * 0.9) + (1 * 0.1); // Increase false positive rate
      }
      
      // Update user feedback score
      performance.userFeedbackScore = 
        (performance.userFeedbackScore * 0.9) + (ratingScore * 0.1);
      
      // Update overall score
      performance.overallScore = 
        (performance.predictiveAccuracy * 0.5) + 
        (performance.userFeedbackScore * 0.3) + 
        ((1 - performance.falsePositiveRate) * 100 * 0.2);
      
      // Save updated performance
      this.sourcePerformance.set(sourceId, performance);
    });
    
    // Adjust scoring algorithm based on accumulated feedback
    this.adjustScoringBasedOnFeedback();
  }
  
  /**
   * Adjust the scoring algorithm based on accumulated feedback
   */
  private adjustScoringBasedOnFeedback(): void {
    // Only adjust if we have enough feedback
    if (this.brandFeedback.length < 5) return;
    
    // Get current parameters
    const currentParams = scoringAlgorithm.getParameters();
    
    // Calculate overall accuracy of our predictions based on user feedback
    const feedbackCorrect = this.brandFeedback.filter(f => f.userRating >= 4).length;
    const feedbackIncorrect = this.brandFeedback.filter(f => f.userRating <= 2).length;
    const totalFeedback = feedbackCorrect + feedbackIncorrect;
    
    if (totalFeedback === 0) return;
    
    const accuracy = feedbackCorrect / totalFeedback;
    
    // If accuracy is good (>80%), don't adjust parameters
    if (accuracy > 0.8) return;
    
    // Make adjustments based on performance
    const newParams = { ...currentParams };
    
    // Find the best performing sources
    const sortedSources = Array.from(this.sourcePerformance.values())
      .sort((a, b) => b.overallScore - a.overallScore);
    
    // If we have clear high performers, increase source weight factor
    if (sortedSources.length > 0 && 
        sortedSources[0].overallScore > 70 && 
        sortedSources[0].overallScore - sortedSources[sortedSources.length - 1].overallScore > 20) {
      newParams.sourceWeightFactor = Math.min(currentParams.sourceWeightFactor + 0.05, 0.7);
    } else {
      // Otherwise, decrease source weight factor
      newParams.sourceWeightFactor = Math.max(currentParams.sourceWeightFactor - 0.05, 0.3);
    }
    
    // Adjust recency factor based on feedback timing
    // Check if users are more likely to confirm recent or older trends
    const recentFeedback = this.brandFeedback.filter(f => {
      const daysSinceFeedback = (new Date().getTime() - f.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceFeedback < 7;
    });
    
    if (recentFeedback.length > 0) {
      const recentCorrect = recentFeedback.filter(f => f.userRating >= 4).length;
      const recentAccuracy = recentCorrect / recentFeedback.length;
      
      if (recentAccuracy > accuracy) {
        // Recent trends are more accurate, increase recency factor
        newParams.recencyFactor = Math.min(currentParams.recencyFactor + 0.05, 0.8);
      } else {
        // Recent trends are less accurate, decrease recency factor
        newParams.recencyFactor = Math.max(currentParams.recencyFactor - 0.05, 0.3);
      }
    }
    
    // Update the scoring algorithm with new parameters
    scoringAlgorithm.updateParameters(newParams);
  }
  
  /**
   * Recommend source weight adjustments based on performance
   */
  getRecommendedSourceWeights(): { sourceId: string, currentWeight: number, recommendedWeight: number }[] {
    const recommendations = [];
    
    // Get top and bottom performers
    const performances = Array.from(this.sourcePerformance.values())
      .sort((a, b) => b.overallScore - a.overallScore);
    
    // Only make recommendations if we have enough performance data
    if (performances.length < 3 || this.brandFeedback.length < 5) {
      return [];
    }
    
    // Calculate total current weight
    const totalWeight = SEED_SOURCES.reduce((sum, source) => sum + source.weight, 0);
    
    // Make recommendations for each source
    for (const performance of performances) {
      const source = SEED_SOURCES.find(s => s.id === performance.sourceId);
      if (!source) continue;
      
      let recommendedWeight = source.weight;
      
      if (performance.overallScore > 75) {
        // High performer - increase weight
        recommendedWeight = Math.min(source.weight * 1.2, source.weight + 10);
      } else if (performance.overallScore < 40) {
        // Low performer - decrease weight
        recommendedWeight = Math.max(source.weight * 0.8, 5);
      }
      
      // Only add recommendation if there's a meaningful change
      if (Math.abs(recommendedWeight - source.weight) >= 2) {
        recommendations.push({
          sourceId: source.id,
          currentWeight: source.weight,
          recommendedWeight: Math.round(recommendedWeight)
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Recommend new sources to add to the seed list
   */
  getRecommendedNewSources(limit: number = 3): DiscoveredSource[] {
    // Get top recommended sources from network expansion
    return networkExpansionService.getTopRecommendedSources(limit);
  }
  
  /**
   * Recommend sources to remove from the seed list
   */
  getRecommendedSourcesForRemoval(): string[] {
    const recommendations = [];
    
    // Look for consistently poor performers
    for (const [sourceId, performance] of this.sourcePerformance.entries()) {
      if (performance.overallScore < 30 && performance.predictiveAccuracy < 40) {
        recommendations.push(sourceId);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get overall system performance metrics
   */
  getSystemPerformanceMetrics() {
    // Calculate feedback accuracy
    const feedbackCorrect = this.brandFeedback.filter(f => f.userRating >= 4).length;
    const feedbackIncorrect = this.brandFeedback.filter(f => f.userRating <= 2).length;
    const totalFeedback = feedbackCorrect + feedbackIncorrect;
    
    const accuracy = totalFeedback > 0 ? (feedbackCorrect / totalFeedback) * 100 : 0;
    
    // Calculate average source performance
    let totalPerformance = 0;
    let sourceCount = 0;
    
    for (const performance of this.sourcePerformance.values()) {
      totalPerformance += performance.overallScore;
      sourceCount++;
    }
    
    const averageSourcePerformance = sourceCount > 0 ? totalPerformance / sourceCount : 0;
    
    return {
      feedbackCount: this.brandFeedback.length,
      trendAccuracy: accuracy,
      averageSourcePerformance,
      topPerformingSourceId: this.getTopPerformingSourceId(),
      scoringParameters: scoringAlgorithm.getParameters()
    };
  }
  
  /**
   * Get the ID of the top performing source
   */
  private getTopPerformingSourceId(): string | null {
    let topSourceId = null;
    let topScore = 0;
    
    for (const [sourceId, performance] of this.sourcePerformance.entries()) {
      if (performance.overallScore > topScore) {
        topScore = performance.overallScore;
        topSourceId = sourceId;
      }
    }
    
    return topSourceId;
  }
  
  /**
   * Get source performance metrics
   */
  getSourcePerformance(): SourcePerformance[] {
    return Array.from(this.sourcePerformance.values());
  }
}

// Export singleton instance
export const feedbackLoopService = new FeedbackLoopService();