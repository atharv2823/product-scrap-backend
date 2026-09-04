import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ScrapedProduct } from './scraped-product.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScrapedProduct]),
    forwardRef(() => AiModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
