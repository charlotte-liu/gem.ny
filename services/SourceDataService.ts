// services/SourceDataService.ts
// Service to fetch and process data from fashion sources

import { SEED_SOURCES, SeedSource, SourceCategory } from '../data/sources/config';

export interface BrandMention {
  brandName: string;
  sourceId: string;
  url: string;
  context: string;
  timestamp: Date;
  sentiment?: number; // -1 to 1 scale
  productName?: string;
  productCategory?: string;
}

export interface SourceStats {
  sourceId: string;
  lastFetched: Date | null;
  totalArticles: number;
  totalBrandMentions: number;
  errorRate: number;
}

export class SourceDataService {
  private sourceStats: Map<string, SourceStats> = new Map();
  private brandMentions: BrandMention[] = [];
  
  constructor() {
    // Initialize stats for each source
    SEED_SOURCES.forEach(source => {
      this.sourceStats.set(source.id, {
        sourceId: source.id,
        lastFetched: null,
        totalArticles: 0,
        totalBrandMentions: 0,
        errorRate: 0
      });
    });
  }

  /**
   * Fetch latest content from all seed sources
   */
  async fetchAllSources(): Promise<void> {
    for (const source of SEED_SOURCES) {
      try {
        await this.fetchSource(source);
      } catch (error) {
        console.error(`Error fetching source ${source.name}:`, error);
        // Update error rate for this source
        const stats = this.sourceStats.get(source.id);
        if (stats) {
          stats.errorRate += 1;
          this.sourceStats.set(source.id, stats);
        }
      }
    }
  }

  /**
   * Fetch content from a specific source
   */
  async fetchSource(source: SeedSource): Promise<void> {
    console.log(`Fetching data from ${source.name}...`);
    
    // This would be implemented with actual HTTP requests and parsing logic
    // For now, we'll just simulate successful fetching
    
    // Update source stats
    const stats = this.sourceStats.get(source.id);
    if (stats) {
      stats.lastFetched = new Date();
      stats.totalArticles += 5; // Simulated number of articles fetched
      this.sourceStats.set(source.id, stats);
    }
    
    // Mock brand mentions extraction
    // In a real implementation, this would parse the fetched content
    this.extractMockBrandMentions(source);
  }

  /**
   * Extract brand mentions from source content (mock implementation)
   */
  private extractMockBrandMentions(source: SeedSource): void {
    // Mock brands with varying popularity by source
    const mockBrands = [
      'Jacquemus', 'Maison Margiela', 'Bottega Veneta', 
      'Loewe', 'Dries Van Noten', 'Jil Sander',
      'Lemaire', 'Maison Kitsuné', 'GmbH', 'Marine Serre'
    ];
    
    // Mock products
    const mockProducts = [
      'Le Chiquito Mini Bag', 'Tabi Boots', 'Cassette Bag',
      'Puzzle Bag', 'Anagram Sweater', 'Cropped Jacket',
      'Stacked Pants', 'Oversized Shirt', 'Asymmetric Dress'
    ];
    
    // Mock contexts
    const mockContexts = [
      'Featured in the Spring collection',
      'Spotted on Instagram influencer',
      'New arrival',
      'Trending this season',
      'Editor\'s pick',
      'Sold out within hours',
      'Limited edition collaboration'
    ];
    
    // Generate 3-7 random brand mentions for this source
    const mentionCount = Math.floor(Math.random() * 5) + 3;
    const stats = this.sourceStats.get(source.id);
    
    for (let i = 0; i < mentionCount; i++) {
      const brandIndex = Math.floor(Math.random() * mockBrands.length);
      const productIndex = Math.floor(Math.random() * mockProducts.length);
      const contextIndex = Math.floor(Math.random() * mockContexts.length);
      
      // Create a brand mention
      const mention: BrandMention = {
        brandName: mockBrands[brandIndex],
        sourceId: source.id,
        url: `${source.url}/article-${Date.now()}-${i}`,
        context: mockContexts[contextIndex],
        timestamp: new Date(),
        sentiment: (Math.random() * 2) - 1, // Random sentiment -1 to 1
        productName: mockProducts[productIndex],
        productCategory: Math.random() > 0.5 ? 'Accessories' : 'Clothing'
      };
      
      this.brandMentions.push(mention);
      
      // Update source stats
      if (stats) {
        stats.totalBrandMentions += 1;
        this.sourceStats.set(source.id, stats);
      }
    }
  }

  /**
   * Get all brand mentions
   */
  getBrandMentions(): BrandMention[] {
    return this.brandMentions;
  }

  /**
   * Get mentions for a specific brand
   */
  getBrandMentionsByBrand(brandName: string): BrandMention[] {
    return this.brandMentions.filter(mention => 
      mention.brandName.toLowerCase() === brandName.toLowerCase()
    );
  }

  /**
   * Get source statistics
   */
  getSourceStats(): SourceStats[] {
    return Array.from(this.sourceStats.values());
  }

  /**
   * Calculate weighted score for a brand based on mentions and source weights
   */
  calculateBrandScore(brandName: string): number {
    const mentions = this.getBrandMentionsByBrand(brandName);
    if (mentions.length === 0) return 0;
    
    let score = 0;
    mentions.forEach(mention => {
      const source = SEED_SOURCES.find(s => s.id === mention.sourceId);
      if (source) {
        // Base score from source weight
        let mentionScore = source.weight;
        
        // Adjust for sentiment if available
        if (mention.sentiment !== undefined) {
          // Convert -1 to 1 scale to 0.5 to 1.5 multiplier
          const sentimentMultiplier = 1 + (mention.sentiment / 2);
          mentionScore *= sentimentMultiplier;
        }
        
        // Adjust for recency (mentions in the last 7 days get a boost)
        const daysSinceMention = (Date.now() - mention.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceMention < 7) {
          mentionScore *= 1.5; // 50% boost for recent mentions
        }
        
        score += mentionScore;
      }
    });
    
    // Normalize score based on number of mentions
    return score / mentions.length;
  }

  /**
   * Get trending brands sorted by score
   */
  getTrendingBrands(limit: number = 10): {brand: string, score: number}[] {
    // Get unique brand names
    const brandNames = [...new Set(this.brandMentions.map(mention => mention.brandName))];
    
    // Calculate score for each brand
    const brandScores = brandNames.map(brand => ({
      brand,
      score: this.calculateBrandScore(brand)
    }));
    
    // Sort by score
    return brandScores.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

// Export singleton instance
export const sourceDataService = new SourceDataService();