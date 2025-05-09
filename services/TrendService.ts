// services/TrendService.ts
// Service to analyze trends from seed sources

import { sourceDataService, BrandMention } from './SourceDataService';
import { TrendingBrandViewModel } from '../types/models';
import { SEED_SOURCES } from '../data/sources/config';

export class TrendService {
  /**
   * Map brand mentions to UI view models
   */
  mapMentionsToViewModel(mentions: BrandMention[]): TrendingBrandViewModel[] {
    return mentions.map((mention, index) => {
      const source = SEED_SOURCES.find(s => s.id === mention.sourceId);
      
      return {
        id: `${mention.brandName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        brand: mention.brandName,
        product_name: mention.productName || `${mention.brandName} Product`,
        context: mention.context,
        link: mention.url,
        image_url: this.generatePlaceholderImageUrl(mention.brandName),
        category: this.categorizeBrand(mention.brandName, mention.productName),
      };
    });
  }
  
  /**
   * Get trending brands for UI display
   */
  getTrendingBrandsForDisplay(limit: number = 10, category?: string): TrendingBrandViewModel[] {
    // Refresh data
    sourceDataService.fetchAllSources();
    
    // Get brand mentions
    const mentions = sourceDataService.getBrandMentions();
    
    // Map to view models
    let viewModels = this.mapMentionsToViewModel(mentions);
    
    // Remove duplicates (keeping first occurrence of each brand)
    const uniqueBrands = new Set<string>();
    viewModels = viewModels.filter(vm => {
      if (uniqueBrands.has(vm.brand)) {
        return false;
      }
      uniqueBrands.add(vm.brand);
      return true;
    });
    
    // Filter by category if provided
    if (category && category !== 'all') {
      viewModels = viewModels.filter(vm => vm.category.toLowerCase() === category.toLowerCase());
    }
    
    // Get trending scores for sorting
    const brandScores = new Map<string, number>();
    uniqueBrands.forEach(brand => {
      brandScores.set(brand, sourceDataService.calculateBrandScore(brand));
    });
    
    // Sort by score
    viewModels.sort((a, b) => 
      (brandScores.get(b.brand) || 0) - (brandScores.get(a.brand) || 0)
    );
    
    // Return limited number
    return viewModels.slice(0, limit);
  }
  
  /**
   * Generate a placeholder image URL (would be replaced by real images)
   */
  private generatePlaceholderImageUrl(brandName: string): string {
    // In a real implementation, this would point to actual brand images
    // For now, we'll use a placeholder service with colors based on the brand name
    
    // Generate a hash code from the brand name for consistent colors
    let hash = 0;
    for (let i = 0; i < brandName.length; i++) {
      hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    
    return `https://via.placeholder.com/400x500/${color}/FFFFFF?text=${encodeURIComponent(brandName)}`;
  }
  
  /**
   * Simple brand categorization (would be more sophisticated in real implementation)
   */
  private categorizeBrand(brandName: string, productName?: string): string {
    // For demo purposes, categorize based on simple rules
    // In a real implementation, this would use more sophisticated methods
    
    const luxuryBrands = ['bottega veneta', 'jacquemus', 'loewe', 'jil sander', 'maison margiela'];
    const streetwearBrands = ['stussy', 'supreme', 'bape', 'kith', 'off-white'];
    const sustainableBrands = ['stella mccartney', 'veja', 'patagonia', 'reformation'];
    
    const brand = brandName.toLowerCase();
    
    if (luxuryBrands.some(b => brand.includes(b))) {
      return 'luxury';
    } else if (streetwearBrands.some(b => brand.includes(b))) {
      return 'streetwear';
    } else if (sustainableBrands.some(b => brand.includes(b))) {
      return 'sustainable';
    } else {
      return 'emerging';
    }
  }
}

// Export singleton instance
export const trendService = new TrendService();