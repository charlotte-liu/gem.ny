// api/routes/brandRoutes.ts
// API routes for brand discovery data

import { sourceDataService } from '../../services/SourceDataService';
import { SEED_SOURCES } from '../../data/sources/config';

// This file would integrate with your backend router
// For now, we'll expose functions that could be called by API handlers

/**
 * Get trending brands
 */
export function getTrendingBrands(limit: number = 10, category?: string) {
  // Fetch fresh data
  sourceDataService.fetchAllSources();
  
  // Get trending brands
  return sourceDataService.getTrendingBrands(limit);
}

/**
 * Get brand details with mentions
 */
export function getBrandDetails(brandName: string) {
  const mentions = sourceDataService.getBrandMentionsByBrand(brandName);
  const score = sourceDataService.calculateBrandScore(brandName);
  
  // Group mentions by source
  const sourceGroups = mentions.reduce((groups, mention) => {
    if (!groups[mention.sourceId]) {
      groups[mention.sourceId] = [];
    }
    groups[mention.sourceId].push(mention);
    return groups;
  }, {} as Record<string, typeof mentions>);
  
  // Format source information with brand mentions
  const sources = Object.entries(sourceGroups).map(([sourceId, mentions]) => {
    const source = SEED_SOURCES.find(s => s.id === sourceId);
    return {
      sourceId,
      sourceName: source?.name || sourceId,
      sourceUrl: source?.url || '',
      mentions
    };
  });
  
  return {
    brandName,
    score,
    sources,
    totalMentions: mentions.length
  };
}

/**
 * Get data sources information
 */
export function getDataSources() {
  const sourceStats = sourceDataService.getSourceStats();
  
  return SEED_SOURCES.map(source => {
    const stats = sourceStats.find(s => s.sourceId === source.id);
    return {
      ...source,
      stats: stats || {
        lastFetched: null,
        totalArticles: 0,
        totalBrandMentions: 0,
        errorRate: 0
      }
    };
  });
}

/**
 * Refresh data from all sources
 */
export async function refreshData() {
  await sourceDataService.fetchAllSources();
  return { success: true, timestamp: new Date() };
}