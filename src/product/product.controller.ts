import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ScrapedProduct } from './scraped-product.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ): Promise<ScrapedProduct[]> {
    return await this.productService.findAll(+limit, +offset);
  }

  @Get('search')
  async searchSimilarProducts(
    @Query('q') query: string,
    @Query('limit') limit = 6,
  ): Promise<ScrapedProduct[]> {
    if (!query) {
      return [];
    }
    return await this.productService.searchSimilar(query, +limit);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ScrapedProduct> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.remove(id);
  }
}
