import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LangChainExtractorService } from './langchain-extractor.service';

describe('LangChainExtractorService', () => {
  let service: LangChainExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangChainExtractorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<LangChainExtractorService>(LangChainExtractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
