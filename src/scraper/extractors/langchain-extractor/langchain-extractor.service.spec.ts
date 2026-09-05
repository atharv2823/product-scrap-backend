import { Test, TestingModule } from '@nestjs/testing';
import { LangChainExtractorService } from './langchain-extractor.service';

describe('LangChainExtractorService', () => {
  let service: LangChainExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LangChainExtractorService],
    }).compile();

    service = module.get<LangChainExtractorService>(LangChainExtractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
