import { Module } from '@nestjs/common';
import { LangchainExtractorService } from './extractors/langchain-extractor/langchain-extractor.service';
import { ScraperService } from './scraper.service';

@Module({
  providers: [LangchainExtractorService, ScraperService]
})
export class ScraperModule {}
