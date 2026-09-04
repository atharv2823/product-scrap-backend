import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapedProduct } from './scraped-product.entity';
import { NormalizedScrapedProduct } from '../scraper/scraper.service';
import { EmbeddingService } from '../ai/embedding/embedding.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ScrapedProduct)
    private productRepo: Repository<ScrapedProduct>,
    @Inject(forwardRef(() => EmbeddingService))
    private embeddingService: EmbeddingService,
  ) {}

  async saveScrapedProducts(products: NormalizedScrapedProduct[]): Promise<ScrapedProduct[]> {
    if (!products || products.length === 0) return [];

    // 1. Batch generate embeddings in a SINGLE API call instead of a loop
    const embeddingTexts = products.map((p) => `${p.platform} ${p.title} Price: ${p.price}`);
    const embeddings = await this.embeddingService.generateBatchEmbeddings(embeddingTexts);

    // 2. Build entities with assigned embeddings
    const entities = products.map((p, index) =>
      this.productRepo.create({
        platform: p.platform,
        title: p.title,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        productUrl: p.productUrl,
        imageUrl: p.imageUrl,
        embedding: embeddings[index] || null,
      }),
    );

    return await this.productRepo.save(entities);
  }

  // Vector similarity search using pgvector cosine distance (<=>)
  async searchSimilar(queryText: string, limit = 5): Promise<ScrapedProduct[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(queryText);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    return await this.productRepo
      .createQueryBuilder('product')
      .orderBy('product.embedding <=> :vector', 'ASC')
      .setParameter('vector', vectorString)
      .limit(limit)
      .getMany();
  }

  async findAll(limit = 20, offset = 0): Promise<ScrapedProduct[]> {
    return await this.productRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<ScrapedProduct | null> {
    return await this.productRepo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.productRepo.delete(id);
    return { success: true, message: `Product ${id} deleted successfully` };
  }
}
