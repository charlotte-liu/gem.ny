// services/ScoringAlgorithm.ts
// Advanced scoring algorithm for brand trend detection

import { BrandMention } from './SourceDataService';
import { SEED_SOURCES, SeedSource } from '../data/sources/config';
import { networkExpansionService, SourceConnection } from './NetworkExpansionService';

// Parameters for scoring algorithm
interface ScoringParameters {
  // Source weight factors
  sourceWeightFactor: number;        // How much source weight influences score (0-1)
  centralityFactor: number;          // How much network centrality influences score (0-1)
  
  // Mention factors
  sentimentFactor: number;           // Impact of sentiment on score (0-1)
  recencyDecayDays: number;          // Days until mention score decays by half
  recencyFactor: number;             // How much recency influences score (0-1)
  frequencyFactor: number;           // How much mention frequency influences score (0-1)
  
  // Context factors
  productMentionBoost: number;       // Boost when specific product is mentioned
  contextDetailBoost: number;        // Boost for detailed context vs. brief mention
}

// Brand trend score with components
export interface BrandTrendScore {
  brandName: string;
  totalScore: number;               // 0-100 final score
  scoreComponents: {
    sourceAuthority: number;        // 0-100 score from source authority
    recency: number;                // 0-100 score from mention recency
    frequency: number;              // 0-100 score from mention frequency
    sentiment: number;              // 0-100 score from mention sentiment
    context: number;                // 0-100 score from mention context
  };
  confidence: number;               // 0-100 confidence in score
  mentions: number;                 // Total number of mentions
  lastMentionDate: Date;            // Date of most recent mention
}

export class ScoringAlgorithm {
  // Default scoring parameters
  private parameters: ScoringParameters = {
    sourceWeightFactor: 0.5,
    centralityFactor: 0.3,
    sentimentFactor: 0.4,
    recencyDecayDays: 14,
    recencyFactor: 0.6,
    frequencyFactor: 0.5,
    productMentionBoost: 1.3,
    contextDetailBoost: 1.2
  };
  
  // Calculated source centrality scores (0-100)
  private sourceCentrality: Map<string, number> = new Map();
  
  /**
   * Initialize the scoring algorithm with network analysis
   */
  async initialize(): Promise<void> {
    // Calculate source centrality based on network connections
    this.calculateSourceCentrality();
  }
  
  /**
   * Calculate centrality scores for all sources in the network
   */
  private calculateSourceCentrality(): void {
    console.log('Calculating source centrality...');
    
    // Get source connections from network expansion service
    const connections = networkExpansionService.getSourceConnections();
    
    // Count incoming connections for each source
    const incomingConnections: Map<string, number> = new Map();
    const connectionStrengths: Map<string, number[]> = new Map();
    
    // Initialize maps for all seed sources
    SEED_SOURCES.forEach(source => {
      incomingConnections.set(source.id, 0);
      connectionStrengths.set(source.id, []);
    });
    
    // Count connections and strengths
    connections.forEach(connection => {
      // Increment incoming connection count
      const currentCount = incomingConnections.get(connection.targetId) || 0;
      incomingConnections.set(connection.targetId, currentCount + 1);
      
      // Add connection strength
      const strengths = connectionStrengths.get(connection.targetId) || [];
      strengths.push(connection.strength);
      connectionStrengths.set(connection.targetId, strengths);
    });
    
    // Calculate maximum possible connections
    const maxPossibleConnections = SEED_SOURCES.length - 1;
    
    // Calculate centrality score for each source
    SEED_SOURCES.forEach(source => {
      const incomingCount = incomingConnections.get(source.id) || 0;
      const strengths = connectionStrengths.get(source.id) || [];
      
      // Connection ratio (0-1)
      const connectionRatio = incomingCount / maxPossibleConnections;
      
      // Average strength (0-100)
      const avgStrength = strengths.length > 0 
        ? strengths.reduce((sum, strength) => sum + strength, 0) / strengths.length 
        : 0;
      
      // Combined centrality score (0-100)
      const centralityScore = (connectionRatio * 50) + (avgStrength * 0.5);
      
      this.sourceCentrality.set(source.id, centralityScore);
    });
    
    console.log('Source centrality calculation complete');
  }
  
  /**
   * Calculate the effective weight for a source
   */
  private getEffectiveSourceWeight(sourceId: string): number {
    const source = SEED_SOURCES.find(s => s.id === sourceId);
    if (!source) return 0;
    
    // Base weight from configuration
    const baseWeight = source.weight;
    
    // Centrality score
    const centrality = this.sourceCentrality.get(sourceId) || 0;
    
    // Calculate effective weight
    return (baseWeight * this.parameters.sourceWeightFactor) + 
           (centrality * this.parameters.centralityFactor);
  }
  
  /**
   * Calculate recency score for a mention
   */
  private calculateRecencyScore(mentionDate: Date): number {
    const now = new Date();
    const daysSinceMention = (now.getTime() - mentionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Exponential decay based on recencyDecayDays
    const decay = Math.pow(0.5, daysSinceMention / this.parameters.recencyDecayDays);
    
    return decay * 100;
  }
  
  /**
   * Calculate frequency score based on mention count and time period
   */
  private calculateFrequencyScore(mentions: BrandMention[]): number {
    if (mentions.length === 0) return 0;
    
    // Sort mentions by date
    const sortedMentions = [...mentions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Get time range
    const newest = sortedMentions[0].timestamp;
    const oldest = sortedMentions[sortedMentions.length - 1].timestamp;
    
    // Calculate days in range
    const daysInRange = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24);
    
    // If all mentions are on the same day
    if (daysInRange < 1) {
      return Math.min(mentions.length * 20, 100); // Cap at 100
    }
    
    // Calculate mentions per day
    const mentionsPerDay = mentions.length / Math.max(daysInRange, 1);
    
    // Score based on mentions per day
    // 1 mention/day = 50 points, 2 mentions/day = 75 points, 3+ mentions/day = 100 points
    return Math.min(mentionsPerDay * 50, 100);
  }
  
  /**
   * Calculate sentiment score from mention sentiments
   */
  private calculateSentimentScore(mentions: BrandMention[]): number {
    if (mentions.length === 0) return 50; // Neutral by default
    
    // Calculate weighted average sentiment
    let totalWeight = 0;
    let weightedSentiment = 0;
    
    mentions.forEach(mention => {
      // Skip mentions without sentiment
      if (mention.sentiment === undefined) return;
      
      // Source weight as multiplier
      const sourceWeight = this.getEffectiveSourceWeight(mention.sourceId);
      
      // Recency as a secondary weight factor
      const recencyWeight = this.calculateRecencyScore(mention.timestamp) / 100;
      
      // Combined weight
      const weight = sourceWeight * recencyWeight;
      
      // Add to weighted average
      weightedSentiment += (mention.sentiment * weight);
      totalWeight += weight;
    });
    
    // If no valid sentiments, return neutral
    if (totalWeight === 0) return 50;
    
    // Average sentiment (-1 to 1)
    const avgSentiment = weightedSentiment / totalWeight;
    
    // Convert to 0-100 scale
    return (avgSentiment + 1) * 50;
  }
  
  /**
   * Calculate context quality score
   */
  private calculateContextScore(mentions: BrandMention[]): number {
    if (mentions.length === 0) return 0;
    
    let totalScore = 0;
    
    mentions.forEach(mention => {
      let contextScore = 50; // Base score
      
      // Boost for product mentions
      if (mention.productName) {
        contextScore *= this.parameters.productMentionBoost;
      }
      
      // Boost for detailed context (approximated by context length)
      if (mention.context && mention.context.length > 50) {
        contextScore *= this.parameters.contextDetailBoost;
      }
      
      totalScore += contextScore;
    });
    
    // Average and cap at 100
    return Math.min(totalScore / mentions.length, 100);
  }
  
  /**
   * Calculate confidence score based on mention count and source diversity
   */
  private calculateConfidenceScore(mentions: BrandMention[]): number {
    if (mentions.length === 0) return 0;
    
    // Count unique sources
    const uniqueSources = new Set(mentions.map(m => m.sourceId)).size;
    
    // Base confidence from mention count (max out at 10 mentions)
    const mentionConfidence = Math.min(mentions.length / 10, 1) * 50;
    
    // Source diversity factor (max out at 3 unique sources)
    const diversityConfidence = Math.min(uniqueSources / 3, 1) * 50;
    
    // Combined confidence
    return mentionConfidence + diversityConfidence;
  }
  
  /**
   * Calculate trend score for a brand based on its mentions
   */
  calculateBrandTrendScore(brandName: string, mentions: BrandMention[]): BrandTrendScore {
    if (mentions.length === 0) {
      return {
        brandName,
        totalScore: 0,
        scoreComponents: {
          sourceAuthority: 0,
          recency: 0,
          frequency: 0,
          sentiment: 50, // Neutral
          context: 0
        },
        confidence: 0,
        mentions: 0,
        lastMentionDate: new Date()
      };
    }
    
    // Sort by date (newest first)
    const sortedMentions = [...mentions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Source authority score
    let sourceAuthorityScore = 0;
    mentions.forEach(mention => {
      sourceAuthorityScore += this.getEffectiveSourceWeight(mention.sourceId);
    });
    sourceAuthorityScore = Math.min(sourceAuthorityScore / mentions.length, 100);
    
    // Recency score (from most recent mention)
    const recencyScore = this.calculateRecencyScore(sortedMentions[0].timestamp);
    
    // Frequency score
    const frequencyScore = this.calculateFrequencyScore(mentions);
    
    // Sentiment score
    const sentimentScore = this.calculateSentimentScore(mentions);
    
    // Context score
    const contextScore = this.calculateContextScore(mentions);
    
    // Compile score components
    const scoreComponents = {
      sourceAuthority: sourceAuthorityScore,
      recency: recencyScore,
      frequency: frequencyScore,
      sentiment: sentimentScore,
      context: contextScore
    };
    
    // Calculate total score (weighted average of components)
    const totalScore = (
      (scoreComponents.sourceAuthority * this.parameters.sourceWeightFactor) +
      (scoreComponents.recency * this.parameters.recencyFactor) +
      (scoreComponents.frequency * this.parameters.frequencyFactor) +
      (scoreComponents.sentiment * this.parameters.sentimentFactor) +
      (scoreComponents.context * (1 - this.parameters.sentimentFactor))
    ) / (
      this.parameters.sourceWeightFactor +
      this.parameters.recencyFactor +
      this.parameters.frequencyFactor +
      this.parameters.sentimentFactor +
      (1 - this.parameters.sentimentFactor)
    );
    
    // Calculate confidence
    const confidence = this.calculateConfidenceScore(mentions);
    
    return {
      brandName,
      totalScore,
      scoreComponents,
      confidence,
      mentions: mentions.length,
      lastMentionDate: sortedMentions[0].timestamp
    };
  }
  
  /**
   * Update scoring parameters
   */
  updateParameters(newParameters: Partial<ScoringParameters>): void {
    this.parameters = {
      ...this.parameters,
      ...newParameters
    };
  }
  
  /**
   * Get current scoring parameters
   */
  getParameters(): ScoringParameters {
    return { ...this.parameters };
  }
}

// Export singleton instance
export const scoringAlgorithm = new ScoringAlgorithm();