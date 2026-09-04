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
            model: 'gemini-3.8-flash',
            temperature: 0,
            apiKey: apiKey,
        });
    }

    async extractProductsFromContent(
        content: string,
        platform: 'amazon' | 'flipkart' | 'ajio',
    ): Promise<ScrapedProductItem[]> {
        try {
            const structuredLlm = this.llm.withStructuredOutput(ScrapedProductListSchema);

            const prompt = `
You are an expert e-commerce data extraction AI.
Extract product cards from this scraped content for ${platform.toUpperCase()}.
Extract up to 6 of the most relevant products with accurate price, rating, image URL, and product URL.

Content:
${content.slice(0, 25000)}
`;

            const result = await structuredLlm.invoke(prompt);
            return result.products;
        } catch (error) {
            this.logger.error(`Error in LangChain extraction for ${platform}:`, error.message);
            return [];
        }
    }
}
