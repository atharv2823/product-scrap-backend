import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSearchController } from './product-search.controller';
import { ProductSearchService } from './product-search.service';
import { ProductSearch } from './entities/product-search.entity';
import { ScraperModule } from '../scraper/scraper.module';
import { ProductModule } from '../product/product.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSearch]),
    ScraperModule,
    ProductModule,
    AiModule,
    AuthModule,
  ],
  controllers: [ProductSearchController],
  providers: [ProductSearchService],
  exports: [ProductSearchService],
})
export class ProductSearchModule {}
