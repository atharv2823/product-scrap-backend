import { Injectable, Logger } from '@nestjs/common';
import { ScraperService } from '../scraper/scraper.service';
import { ProductService } from '../product/product.service';
import { VisionService } from '../ai/vision/vision.service';

@Injectable()
export class ProductSearchService {
  private readonly logger = new Logger(ProductSearchService.name);

  constructor(
    private scraperService: ScraperService,
    private productService: ProductService,
    private visionService: VisionService,
  ) {}

  async processImageSearch(file: Express.Multer.File) {
    // 1. Send image to Gemini Vision model to detect product details & optimal query
    const analysis = await this.visionService.analyzeProductImage(file);

    this.logger.log(`Visual AI detected: "${analysis.productName}" (Query: "${analysis.searchQuery}")`);

    // 2. Scrape Amazon, Flipkart, Ajio in parallel using the detected search query
    const scrapedProducts = await this.scraperService.scrapeAllPlatforms(analysis.searchQuery);

    // 3. Store into Supabase pgvector with embeddings in the background (non-blocking)
    if (scrapedProducts.length > 0) {
      this.productService
        .saveScrapedProducts(scrapedProducts)
        .then((saved) =>
          this.logger.log(`Background sync complete: saved ${saved.length} products to pgvector`),
        )
        .catch((err) =>
          this.logger.error(`Background pgvector sync failed: ${err.message}`),
        );
    }

    // 4. Return dynamic user feedback and scraped product comparison immediately
    return {
      success: true,
      userFeedback: analysis.userFeedback,
      analysis: {
        productName: analysis.productName,
        brand: analysis.brand,
        category: analysis.category,
        color: analysis.color,
        searchQuery: analysis.searchQuery,
      },
      totalFound: scrapedProducts.length,
      products: scrapedProducts,
    };
  }

  async processTextSearch(query: string) {
    this.logger.log(`Initiating multi-platform scrape for text query: "${query}"`);

    const scrapedProducts = await this.scraperService.scrapeAllPlatforms(query);

    // Background sync to pgvector
    if (scrapedProducts.length > 0) {
      this.productService
        .saveScrapedProducts(scrapedProducts)
        .then((saved) =>
          this.logger.log(`Background sync complete: saved ${saved.length} products to pgvector`),
        )
        .catch((err) =>
          this.logger.error(`Background pgvector sync failed: ${err.message}`),
        );
    }

    return {
      success: true,
      query,
      totalFound: scrapedProducts.length,
      products: scrapedProducts,
    };
  }
}
