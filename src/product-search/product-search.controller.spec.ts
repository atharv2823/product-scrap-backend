import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ProductSearchController } from './product-search.controller';
import { ProductSearchService } from './product-search.service';

describe('ProductSearchController', () => {
  let controller: ProductSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSearchController],
      providers: [
        {
          provide: ProductSearchService,
          useValue: {
            processImageSearch: jest.fn(),
            processTextSearch: jest.fn(),
            getUserSearchHistory: jest.fn(),
            getUserSearchById: jest.fn(),
            clearUserSearchHistory: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductSearchController>(ProductSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
