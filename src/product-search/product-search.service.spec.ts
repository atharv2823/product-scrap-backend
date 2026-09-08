import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductSearchService } from './product-search.service';
import { ProductSearch } from './entities/product-search.entity';
import { ScraperService } from '../scraper/scraper.service';
import { ProductService } from '../product/product.service';
import { VisionService } from '../ai/vision/vision.service';

describe('ProductSearchService', () => {
  let service: ProductSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSearchService,
        {
          provide: ScraperService,
          useValue: {
            scrapeAllPlatforms: jest.fn(),
          },
        },
        {
          provide: ProductService,
          useValue: {
            saveScrapedProducts: jest.fn(),
          },
        },
        {
          provide: VisionService,
          useValue: {
            analyzeProductImage: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductSearch),
          useValue: {
            create: jest
              .fn()
              .mockImplementation((dto) => ({ id: 'mock-search-id', ...dto })),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'mock-search-id', ...entity }),
              ),
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            findOne: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ProductSearchService>(ProductSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
