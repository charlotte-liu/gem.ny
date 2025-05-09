// services/NetworkExpansionService.ts
// Service to expand the seed network through various techniques

import { SEED_SOURCES, SeedSource, SourceCategory } from '../data/sources/config';

// Connection type between sources
export interface SourceConnection {
  sourceId: string;      // Origin source
  targetId: string;      // Target source
  connectionType: 'backlink' | 'mention' | 'social' | 'related';
  strength: number;      // 0-100 connection strength
  discoveredAt: Date;    // When this connection was discovered
}

// New source discovered through network expansion
export interface DiscoveredSource {
  name: string;          // Source name
  url: string;           // Source URL
  discoveryMethod: 'backlink' | 'mention' | 'social' | 'related';
  seedConnections: {     // Connections to seed sources
    sourceId: string;    // Seed source ID
    strength: number;    // 0-100 connection strength
  }[];
  estimatedAuthority: number; // 0-100 estimated authority
  discoveredAt: Date;    // When this source was discovered
  category?: SourceCategory; // Source category if known
}

export class NetworkExpansionService {
  private sourceConnections: SourceConnection[] = [];
  private discoveredSources: DiscoveredSource[] = [];
  
  // Methods for network expansion
  
  /**
   * Analyze backlinks between seed sources 
   * (in a real implementation, this would use Ahrefs API or similar)
   */
  async analyzeBacklinks(): Promise<void> {
    console.log('Analyzing backlinks between seed sources...');
    
    // Mock implementation - in a real app this would call Ahrefs API
    // This would identify which fashion sites link to each other
    
    // Generate some mock connections between sources
    for (let i = 0; i < SEED_SOURCES.length; i++) {
      for (let j = 0; j < SEED_SOURCES.length; j++) {
        // Don't connect a source to itself
        if (i === j) continue;
        
        // Only create connections with 40% probability (for demonstration)
        if (Math.random() > 0.4) continue;
        
        const source = SEED_SOURCES[i];
        const target = SEED_SOURCES[j];
        
        // Create a connection
        const connection: SourceConnection = {
          sourceId: source.id,
          targetId: target.id,
          connectionType: 'backlink',
          strength: Math.floor(Math.random() * 80) + 20, // 20-100 strength
          discoveredAt: new Date()
        };
        
        this.sourceConnections.push(connection);
      }
    }
    
    console.log(`Discovered ${this.sourceConnections.length} backlink connections`);
  }
  
  /**
   * Discover new fashion sources through backlink analysis
   * (in a real implementation, this would use Ahrefs API or similar)
   */
  async discoverSourcesFromBacklinks(): Promise<void> {
    console.log('Discovering new sources from backlinks...');
    
    // Mock new fashion sites that might be discovered
    const potentialSources = [
      { name: 'The Fashion Law', url: 'https://www.thefashionlaw.com' },
      { name: 'Business of Fashion', url: 'https://www.businessoffashion.com' },
      { name: 'Vogue Runway', url: 'https://www.vogue.com/fashion-shows' },
      { name: 'Grailed', url: 'https://www.grailed.com/drycleanonly' },
      { name: 'Highxtar', url: 'https://highxtar.com' },
      { name: 'PAUSE Magazine', url: 'https://pausemag.co.uk' },
      { name: 'Fucking Young!', url: 'https://fuckingyoung.es' },
      { name: 'Vestoj', url: 'http://vestoj.com' },
      { name: 'System Magazine', url: 'https://system-magazine.com' },
      { name: 'SHOWstudio', url: 'https://www.showstudio.com' }
    ];
    
    // For each seed source, discover 0-3 new sources
    for (const source of SEED_SOURCES) {
      const discoveryCount = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < discoveryCount; i++) {
        // Pick a random source from potential sources
        const randomIndex = Math.floor(Math.random() * potentialSources.length);
        const potentialSource = potentialSources[randomIndex];
        
        // Check if we've already discovered this source
        const alreadyDiscovered = this.discoveredSources.some(
          ds => ds.url === potentialSource.url
        );
        
        if (!alreadyDiscovered) {
          // Find connections to existing seed sources
          const seedConnections = SEED_SOURCES
            .filter(seed => seed.id !== source.id && Math.random() > 0.5)
            .map(seed => ({
              sourceId: seed.id,
              strength: Math.floor(Math.random() * 70) + 30 // 30-100 strength
            }));
          
          // Add connection to the discovering source
          seedConnections.push({
            sourceId: source.id,
            strength: Math.floor(Math.random() * 30) + 70 // 70-100 strength (stronger)
          });
          
          // Create the discovered source
          const discoveredSource: DiscoveredSource = {
            name: potentialSource.name,
            url: potentialSource.url,
            discoveryMethod: 'backlink',
            seedConnections,
            estimatedAuthority: Math.floor(Math.random() * 60) + 20, // 20-80 authority
            discoveredAt: new Date(),
            category: this.guessCategoryFromUrl(potentialSource.url)
          };
          
          this.discoveredSources.push(discoveredSource);
        }
      }
    }
    
    console.log(`Discovered ${this.discoveredSources.length} new sources from backlinks`);
  }
  
  /**
   * Crawl fashion-focused Substacks with relevant keywords
   */
  async crawlFashionSubstacks(): Promise<void> {
    console.log('Crawling fashion Substacks...');
    
    // Mock Substack newsletters about fashion
    const fashionSubstacks = [
      { name: 'Blackbird Spyplane', url: 'https://blackbirdspyplane.substack.com' },
      { name: 'Opulent Tips', url: 'https://opulenttips.substack.com' },
      { name: 'Fashion Critical', url: 'https://fashioncritical.substack.com' },
      { name: 'High Fashion Talk', url: 'https://highfashiontalk.substack.com' },
      { name: 'The Line Up', url: 'https://thelineup.substack.com' }
    ];
    
    // For demonstration purposes, add these as discovered sources
    for (const substack of fashionSubstacks) {
      // Connect to 2-3 random seed sources
      const seedCount = 2 + Math.floor(Math.random() * 2);
      const seedIndices = new Set<number>();
      
      // Pick random seed sources
      while (seedIndices.size < seedCount) {
        seedIndices.add(Math.floor(Math.random() * SEED_SOURCES.length));
      }
      
      // Create connections to seed sources
      const seedConnections = Array.from(seedIndices).map(index => ({
        sourceId: SEED_SOURCES[index].id,
        strength: Math.floor(Math.random() * 50) + 30 // 30-80 strength
      }));
      
      // Create the discovered source
      const discoveredSource: DiscoveredSource = {
        name: substack.name,
        url: substack.url,
        discoveryMethod: 'related',
        seedConnections,
        estimatedAuthority: Math.floor(Math.random() * 40) + 30, // 30-70 authority
        discoveredAt: new Date(),
        category: SourceCategory.BLOG
      };
      
      this.discoveredSources.push(discoveredSource);
    }
    
    console.log(`Added ${fashionSubstacks.length} fashion Substacks`);
  }
  
  /**
   * Analyze social graphs of fashion authorities
   */
  async analyzeSocialGraphs(): Promise<void> {
    console.log('Analyzing social graphs of fashion authorities...');
    
    // Mock implementation - in a real app this would use social media APIs
    // This is just a placeholder for now
    
    // This would discover connections between sources based on social media interactions
    // such as follows, mentions, likes, etc.
    
    // It would also discover new potential sources from social media
  }
  
  /**
   * Extract mentioned publications from all seed content
   */
  async extractMentionedPublications(): Promise<void> {
    console.log('Extracting mentioned publications from seed content...');
    
    // Mock implementation - in a real app this would analyze article content
    // to find mentions of other publications
    
    // This would discover new fashion publications that are mentioned in existing content
  }
  
  /**
   * Get all discovered source connections
   */
  getSourceConnections(): SourceConnection[] {
    return this.sourceConnections;
  }
  
  /**
   * Get all discovered sources
   */
  getDiscoveredSources(): DiscoveredSource[] {
    return this.discoveredSources;
  }
  
  /**
   * Get top recommended sources to add to the seed list
   */
  getTopRecommendedSources(limit: number = 5): DiscoveredSource[] {
    // Sort by estimated authority and connection strength
    return this.discoveredSources
      .sort((a, b) => {
        // Calculate average connection strength
        const avgStrengthA = a.seedConnections.reduce((sum, conn) => sum + conn.strength, 0) / 
          a.seedConnections.length;
        const avgStrengthB = b.seedConnections.reduce((sum, conn) => sum + conn.strength, 0) / 
          b.seedConnections.length;
        
        // Combined score
        const scoreA = (a.estimatedAuthority * 0.7) + (avgStrengthA * 0.3);
        const scoreB = (b.estimatedAuthority * 0.7) + (avgStrengthB * 0.3);
        
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
  
  /**
   * Guess the category of a source based on its URL
   */
  private guessCategoryFromUrl(url: string): SourceCategory {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('shop') || lowerUrl.includes('store') || 
        lowerUrl.includes('grailed') || lowerUrl.includes('ssense')) {
      return SourceCategory.ECOMMERCE;
    } else if (lowerUrl.includes('magazine') || lowerUrl.includes('vogue') || 
              lowerUrl.includes('elle') || lowerUrl.includes('gq')) {
      return SourceCategory.MAGAZINE;
    } else if (lowerUrl.includes('substack') || lowerUrl.includes('blog')) {
      return SourceCategory.BLOG;
    } else {
      return SourceCategory.EDITORIAL;
    }
  }
  
  /**
   * Run all network expansion methods
   */
  async runFullNetworkExpansion(): Promise<void> {
    await this.analyzeBacklinks();
    await this.discoverSourcesFromBacklinks();
    await this.crawlFashionSubstacks();
    await this.analyzeSocialGraphs();
    await this.extractMentionedPublications();
    
    console.log(`Network expansion complete. Discovered ${this.discoveredSources.length} new sources`);
  }
}

// Export singleton instance
export const networkExpansionService = new NetworkExpansionService();