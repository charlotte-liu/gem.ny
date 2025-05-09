// data/sources/config.ts
// Configuration file for fashion trend data sources

export enum SourceCategory {
    EDITORIAL = 'editorial',
    SOCIAL = 'social',
    ECOMMERCE = 'ecommerce',
    MAGAZINE = 'magazine',
    BLOG = 'blog',
  }
  
  export interface SeedSource {
    id: string;           // Unique identifier
    name: string;         // Display name
    url: string;          // Base URL
    category: SourceCategory;  // Source category
    weight: number;       // Authority weight (0-100)
    feedUrl?: string;     // RSS feed if available
    apiEndpoint?: string; // API endpoint if available
    selectors?: {         // CSS selectors for scraping
      articles: string;
      brands: string;
      products: string;
    };
  }
  
  // Initial seed sources with their assigned weights
  export const SEED_SOURCES: SeedSource[] = [
    {
      id: 'highsnobiety',
      name: 'Highsnobiety',
      url: 'https://www.highsnobiety.com',
      category: SourceCategory.EDITORIAL,
      weight: 30,
      feedUrl: 'https://www.highsnobiety.com/feed/',
      selectors: {
        articles: 'article.post',
        brands: '.brand-mention', // Replace with actual selectors after inspection
        products: '.product-mention', // Replace with actual selectors after inspection
      }
    },
    {
      id: 'ssense',
      name: 'SSENSE Editorial',
      url: 'https://www.ssense.com/en-us/editorial',
      category: SourceCategory.EDITORIAL,
      weight: 30,
      selectors: {
        articles: '.editorial-item',
        brands: '.brand-name', // Replace with actual selectors after inspection
        products: '.product-item', // Replace with actual selectors after inspection
      }
    },
    {
      id: 'hypebeast',
      name: 'Hypebeast Fashion',
      url: 'https://hypebeast.com/fashion',
      category: SourceCategory.EDITORIAL,
      weight: 15,
      feedUrl: 'https://hypebeast.com/feed',
      selectors: {
        articles: '.post-box',
        brands: '.tag-list', // Replace with actual selectors after inspection
        products: '.product-card', // Replace with actual selectors after inspection
      }
    },
    {
      id: 'dazed',
      name: 'Dazed & Confused',
      url: 'https://www.dazeddigital.com/fashion',
      category: SourceCategory.MAGAZINE,
      weight: 10,
      selectors: {
        articles: '.card',
        brands: '.brand-reference', // Replace with actual selectors after inspection
        products: '.product-reference', // Replace with actual selectors after inspection
      }
    },
    {
      id: 'i-d',
      name: 'i-D',
      url: 'https://i-d.vice.com/en_uk/topic/fashion',
      category: SourceCategory.MAGAZINE,
      weight: 5,
      selectors: {
        articles: '.grid__wrapper--item',
        brands: '.brand-tag', // Replace with actual selectors after inspection
        products: '.product-tag', // Replace with actual selectors after inspection
      }
    },
    {
      id: '10magazine',
      name: '10 Magazine',
      url: 'https://www.10magazine.com',
      category: SourceCategory.MAGAZINE,
      weight: 10,
      selectors: {
        articles: '.article-item',
        brands: '.tag-item', // Replace with actual selectors after inspection
        products: '.product-item', // Replace with actual selectors after inspection
      }
    }
  ];
  
  // Helper function to get a source by ID
  export function getSourceById(id: string): SeedSource | undefined {
    return SEED_SOURCES.find(source => source.id === id);
  }
  
  // Helper function to get sources by category
  export function getSourcesByCategory(category: SourceCategory): SeedSource[] {
    return SEED_SOURCES.filter(source => source.category === category);
  }
  
  // Validate that weights sum to 100
  function validateWeights() {
    const totalWeight = SEED_SOURCES.reduce((sum, source) => sum + source.weight, 0);
    if (totalWeight !== 100) {
      console.warn(`Warning: Source weights sum to ${totalWeight}, not 100`);
    }
  }
  
  // Run validation on import
  validateWeights();