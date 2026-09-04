// src/scraper/scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FirecrawlApp from '@mendable/firecrawl-js';

import { ScrapedProductItem } from './interfaces/product-schema';
import { LangChainExtractorService } from './extractors/langchain-extractor/langchain-extractor.service';

export interface NormalizedScrapedProduct extends ScrapedProductItem {
    platform: 'amazon' | 'flipkart' | 'ajio';
}

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);
    private firecrawl: FirecrawlApp;

    constructor(
        private configService: ConfigService,
        private extractor: LangChainExtractorService,
    ) {
        const firecrawlApiKey = this.configService.get<string>('FIRECRAWL_API_KEY');
        if (firecrawlApiKey) {
            this.firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });
        }
    }

    // Scrape all 3 platforms in parallel
    async scrapeAllPlatforms(searchQuery: string): Promise<NormalizedScrapedProduct[]> {
        this.logger.log(`Starting multi-platform scrape for: "${searchQuery}"`);

        const encodedQuery = encodeURIComponent(searchQuery);

        const platforms: Array<{ name: 'amazon' | 'flipkart' | 'ajio'; url: string }> = [
            { name: 'amazon', url: `https://www.amazon.in/s?k=${encodedQuery}` },
            { name: 'flipkart', url: `https://www.flipkart.com/search?q=${encodedQuery}` },
            { name: 'ajio', url: `https://www.ajio.com/search/?text=${encodedQuery}` },
        ];

        const pageFetchPromises = platforms.map(async (p) => {
            try {
                const markdown = await this.fetchPageMarkdown(p.url);
                return markdown ? { platform: p.name, content: markdown } : null;
            } catch (err) {
                this.logger.error(`Failed to fetch page for ${p.name}: ${err.message}`);
                return null;
            }
        });

        const fetchResults = await Promise.allSettled(pageFetchPromises);
        const validPages = fetchResults
            .filter((r): r is PromiseFulfilledResult<{ platform: 'amazon' | 'flipkart' | 'ajio'; content: string }> => r.status === 'fulfilled' && !!r.value)
            .map((r) => r.value);

        if (validPages.length === 0) return [];

        const items = await this.extractor.extractAllPlatformsCombined(validPages);
        return items.map((item) => ({
            ...item,
            platform: (item.platform as 'amazon' | 'flipkart' | 'ajio') || 'amazon',
        }));
    }

    private async fetchPageMarkdown(url: string): Promise<string | null> {
        if (this.firecrawl) {
            const response = await this.firecrawl.scrapeUrl(url, { formats: ['markdown'] });
            return response.markdown || null;
        }
        // Fallback: Basic fetch if Firecrawl API key is not configured
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        return await res.text();
    }
}
