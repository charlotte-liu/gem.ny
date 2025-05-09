// types/models.ts
// Type definitions for data models used in the app

// Brand information
export interface Brand {
    id: string;           // Unique identifier
    name: string;         // Brand name
    trendScore: number;   // 0-100 calculated trend score
    category?: string;    // Brand category (e.g., luxury, streetwear)
    logo?: string;        // URL to brand logo
    description?: string; // Brief description
    website?: string;     // Brand website
  }
  
  // Product information
  export interface Product {
    id: string;           // Unique identifier
    name: string;         // Product name
    brandId: string;      // Associated brand ID
    category: string;     // Product category
    image?: string;       // Product image URL
    description?: string; // Product description
    link?: string;        // Link to product
    price?: number;       // Price if available
    currency?: string;    // Currency code
    mentionCount?: number; // How many times mentioned
  }
  
  // Mention of a brand/product in a source
  export interface Mention {
    id: string;           // Unique identifier
    sourceId: string;     // Source ID
    brandId: string;      // Brand ID
    productId?: string;   // Product ID if applicable
    url: string;          // URL to the mention
    context: string;      // Context text
    timestamp: Date;      // When the mention was published
    sentiment: number;    // -1 to 1 sentiment score
    authorityScore: number; // 0-100 authority of this mention
  }
  
  // Source network information for analytics
  export interface SourceNetwork {
    sourceId: string;
    connections: {
      targetSourceId: string;
      strength: number; // 0-100 connection strength
      type: 'link' | 'mention' | 'social'; // Type of connection
    }[];
  }
  
  // UI model for trending brand display
  export interface TrendingBrandViewModel {
    id: string;
    brand: string;
    product_name: string;
    context: string;
    link: string;
    image_url: string;
    category: string;
  }