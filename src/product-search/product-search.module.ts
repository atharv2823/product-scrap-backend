import { Module } from '@nestjs/common';
import { ProductSearchController } from './product-search.controller';
import { ProductSearchService } from './product-search.service';
import { ScraperModule } from '../scraper/scraper.module';
import { ProductModule } from '../product/product.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ScraperModule, ProductModule, AiModule],
  controllers: [ProductSearchController],
  providers: [ProductSearchService],
  exports: [ProductSearchService],
})
export class ProductSearchModule {}
