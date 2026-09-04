// src/product/product.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapedProduct } from './scraped-product.entity';
import { NormalizedScrapedProduct } from '../scraper/scraper.service';
import { EmbeddingService } from 'src/ai/embedding/embedding.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ScrapedProduct)
    private productRepo: Repository<ScrapedProduct>,
    private embeddingService: EmbeddingService,
  ) {}

  async saveScrapedProducts(products: NormalizedScrapedProduct[]): Promise<ScrapedProduct[]> {
    const saved: ScrapedProduct[] = [];
    for (const p of products) {
      // Create embedding from title and platform
      const embeddingText = `${p.platform} ${p.title} Price: ${p.price}`;
      const embedding = await this.embeddingService.generateEmbedding(embeddingText);

      const entity = this.productRepo.create({
        platform: p.platform,
        title: p.title,
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        productUrl: p.productUrl,
        imageUrl: p.imageUrl,
        embedding: embedding,
      });

      saved.push(await this.productRepo.save(entity));
    }
    return saved;
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
}
