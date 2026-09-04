import { Test, TestingModule } from '@nestjs/testing';
import { LangchainExtractorService } from './langchain-extractor.service';

describe('LangchainExtractorService', () => {
  let service: LangchainExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LangchainExtractorService],
    }).compile();

    service = module.get<LangchainExtractorService>(LangchainExtractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
