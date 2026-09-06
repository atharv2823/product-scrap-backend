import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ScrapedProduct } from './scraped-product.entity';
import { EmbeddingService } from '../ai/embedding/embedding.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ScrapedProduct),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: EmbeddingService,
          useValue: {
            generateBatchEmbeddings: jest.fn(),
            generateEmbedding: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
