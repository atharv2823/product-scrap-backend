import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ScrapedProductItem, ScrapedProductListSchema } from '../../interfaces/product-schema';

@Injectable()
export class LangChainExtractorService {
    private readonly logger = new Logger(LangChainExtractorService.name);
    private llm: any;

    constructor(private configService: ConfigService) {
        const apiKey =
            this.configService.get<string>('GEMINI_API_KEY') ||
            this.configService.get<string>('OPENAI_API_KEY');

        this.llm = new ChatGoogleGenerativeAI({
            model: 'gemini-3.6-flash',
            temperature: 0,
            apiKey: apiKey,
        });
    }

    async extractProductsFromContent(
        content: string,
        platform: 'amazon' | 'flipkart' | 'ajio',
    ): Promise<ScrapedProductItem[]> {
        return this.withRetry(async () => {
            const structuredLlm = this.llm.withStructuredOutput(ScrapedProductListSchema);

            const prompt = `
You are an expert e-commerce data extraction AI.
Extract product cards from this scraped content for ${platform.toUpperCase()}.
Extract up to 6 of the most relevant products with accurate price, rating, image URL, and product URL.

Content:
${content.slice(0, 20000)}
`;

            const result = await structuredLlm.invoke(prompt);
            return result.products || [];
        });
    }

    async extractAllPlatformsCombined(
        platformPages: Array<{ platform: 'amazon' | 'flipkart' | 'ajio'; content: string }>,
    ): Promise<ScrapedProductItem[]> {
        return this.withRetry(async () => {
            const structuredLlm = this.llm.withStructuredOutput(ScrapedProductListSchema);

            const combinedSnippet = platformPages
                .map((p) => `\n=== SOURCE: ${p.platform.toUpperCase()} ===\n${p.content.slice(0, 10000)}`)
                .join('\n\n');

            const prompt = `
You are an expert e-commerce data extraction AI.
Extract product listings from the provided search results across multiple platforms (Amazon, Flipkart, Ajio).
For each platform, extract up to 4 top products with accurate title, price, originalPrice, rating, productUrl, and imageUrl.
Assign the correct "platform" field ('amazon', 'flipkart', or 'ajio') to each extracted product item.

Search Results:
${combinedSnippet}
`;

            const result = await structuredLlm.invoke(prompt);
            return result.products || [];
        });
    }

    private async withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit =
                error?.status === 429 ||
                error?.message?.includes('429') ||
                error?.message?.includes('Quota exceeded');

            if (isRateLimit && retries > 0) {
                this.logger.warn(`Rate limit encountered (429). Pausing ${delayMs / 1000}s before retry (${retries} retries left)...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                return this.withRetry(fn, retries - 1, delayMs * 2);
            }
            this.logger.error('Extraction error:', error.message);
            return [] as unknown as T;
        }
    }
}
