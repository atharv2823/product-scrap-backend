// src/product-search/product-search.service.ts
import { Injectable } from '@nestjs/common';
import { ScraperService } from '../scraper/scraper.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class ProductSearchService {
  constructor(
    private scraperService: ScraperService,
    private productService: ProductService,
  ) { }

  async processImageSearch(file: Express.Multer.File) {
    // 1. Send image to Vision model or extract query
    // Example detected query from image:
    const detectedQuery = 'Nike Air Jordan 1 Retro High';

    // 2. Scrape Amazon, Flipkart, Ajio in parallel
    const scrapedProducts = await this.scraperService.scrapeAllPlatforms(detectedQuery);

    // 3. Store into Supabase pgvector with embeddings
    const savedProducts = await this.productService.saveScrapedProducts(scrapedProducts);

    return {
      success: true,
      detectedQuery,
      totalFound: savedProducts.length,
      products: savedProducts,
    };
  }
}
