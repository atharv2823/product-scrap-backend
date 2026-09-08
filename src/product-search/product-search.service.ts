import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperService } from '../scraper/scraper.service';
import { ProductService } from '../product/product.service';
import { VisionService } from '../ai/vision/vision.service';
import { ProductSearch } from './entities/product-search.entity';

@Injectable()
export class ProductSearchService {
  private readonly logger = new Logger(ProductSearchService.name);

  constructor(
    private scraperService: ScraperService,
    private productService: ProductService,
    private visionService: VisionService,
    @InjectRepository(ProductSearch)
    private productSearchRepo: Repository<ProductSearch>,
  ) {}

  async processImageSearch(file: Express.Multer.File, userId?: string) {
    // 1. Send image to Gemini Vision model to detect product details & optimal query
    const analysis = await this.visionService.analyzeProductImage(file);

    this.logger.log(
      `Visual AI detected: "${analysis.productName}" (Query: "${analysis.searchQuery}")`,
    );

    // 2. Scrape Amazon, Flipkart, Ajio in parallel using the detected search query
    const scrapedProducts = await this.scraperService.scrapeAllPlatforms(
      analysis.searchQuery,
    );

    // 3. Store into Supabase pgvector with embeddings in the background (non-blocking)
    if (scrapedProducts.length > 0) {
      this.productService
        .saveScrapedProducts(scrapedProducts)
        .then((saved) =>
          this.logger.log(
            `Background sync complete: saved ${saved.length} products to pgvector`,
          ),
        )
        .catch((err) =>
          this.logger.error(`Background pgvector sync failed: ${err.message}`),
        );
    }

    // 4. Save search history if user is authenticated
    let savedSearchId: string | undefined;
    if (userId) {
      try {
        const searchRecord: ProductSearch = this.productSearchRepo.create({
          userId,
          searchType: 'image',
          query: analysis.searchQuery,
          userFeedback: analysis.userFeedback,
          analysis: {
            productName: analysis.productName,
            brand: analysis.brand,
            category: analysis.category,
            color: analysis.color,
            searchQuery: analysis.searchQuery,
          },
          totalFound: scrapedProducts.length,
          results: scrapedProducts,
        });
        const saved: ProductSearch =
          await this.productSearchRepo.save(searchRecord);
        savedSearchId = saved.id;
        this.logger.log(
          `Saved image search history ${saved.id} for user ${userId}`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to save image search history: ${err?.message || err}`,
        );
      }
    }

    // 5. Return dynamic user feedback and scraped product comparison immediately
    return {
      success: true,
      searchId: savedSearchId,
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

  async processTextSearch(query: string, userId?: string) {
    this.logger.log(
      `Initiating multi-platform scrape for text query: "${query}"`,
    );

    const scrapedProducts = await this.scraperService.scrapeAllPlatforms(query);

    // Background sync to pgvector
    if (scrapedProducts.length > 0) {
      this.productService
        .saveScrapedProducts(scrapedProducts)
        .then((saved) =>
          this.logger.log(
            `Background sync complete: saved ${saved.length} products to pgvector`,
          ),
        )
        .catch((err) =>
          this.logger.error(`Background pgvector sync failed: ${err.message}`),
        );
    }

    // Save search history if user is authenticated
    let savedSearchId: string | undefined;
    if (userId) {
      try {
        const searchRecord: ProductSearch = this.productSearchRepo.create({
          userId,
          searchType: 'text',
          query,
          userFeedback: null,
          analysis: null,
          totalFound: scrapedProducts.length,
          results: scrapedProducts,
        });
        const saved: ProductSearch =
          await this.productSearchRepo.save(searchRecord);
        savedSearchId = saved.id;
        this.logger.log(
          `Saved text search history ${saved.id} for user ${userId}`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to save text search history: ${err?.message || err}`,
        );
      }
    }

    return {
      success: true,
      searchId: savedSearchId,
      query,
      totalFound: scrapedProducts.length,
      products: scrapedProducts,
    };
  }

  async getUserSearchHistory(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ total: number; searches: ProductSearch[] }> {
    const [searches, total] = await this.productSearchRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { total, searches };
  }

  async getUserSearchById(
    id: string,
    userId: string,
  ): Promise<ProductSearch | null> {
    return await this.productSearchRepo.findOne({
      where: { id, userId },
    });
  }

  async clearUserSearchHistory(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.productSearchRepo.delete({ userId });
    return {
      success: true,
      message: `Search history cleared for user ${userId}`,
    };
  }
}
