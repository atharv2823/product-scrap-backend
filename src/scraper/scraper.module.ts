import { Module } from '@nestjs/common';
import { LangChainExtractorService } from './extractors/langchain-extractor/langchain-extractor.service';
import { ScraperService } from './scraper.service';

@Module({
  providers: [LangChainExtractorService, ScraperService],
  exports: [ScraperService, LangChainExtractorService],
})
export class ScraperModule {}
