import { Test, TestingModule } from '@nestjs/testing';
import { ProductSearchService } from './product-search.service';
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
      ],
    }).compile();

    service = module.get<ProductSearchService>(ProductSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
