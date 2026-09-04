import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { ProductVisualAnalysisSchema, ProductVisualAnalysis } from './product-visual-analysis.schema';

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private llm: ChatGoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('OPENAI_API_KEY');

    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-3.6-flash',
      temperature: 0.1,
      apiKey: apiKey,
    });
  }

  async analyzeProductImage(file: Express.Multer.File): Promise<ProductVisualAnalysis> {
    this.logger.log(`Analyzing uploaded product image: ${file.originalname} (${file.size} bytes)`);

    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype && file.mimetype.startsWith('image/')
      ? file.mimetype
      : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const structuredLlm = this.llm.withStructuredOutput(ProductVisualAnalysisSchema);

    const message = new HumanMessage({
      content: [
        {
          type: 'text',
          text: `You are an expert e-commerce visual search AI.
Inspect this product image with high precision.
1. Determine the exact product name, model, brand, category, and prominent colors.
2. Formulate a clean, highly effective search query (e.g. "Nike Air Jordan 1 Retro High" or "Puma Smash v2 White Sneakers") that will find this exact product or closest matches on e-commerce sites like Amazon, Flipkart, or Ajio.
3. Provide concise, friendly user feedback explaining what you detected in the image.`,
        },
        {
          type: 'image_url',
          image_url: dataUrl,
        },
      ],
    });

    return this.withRetry(async () => {
      const analysis = await structuredLlm.invoke([message]);
      this.logger.log(`Visual detection succeeded: "${analysis.productName}" -> Search Query: "${analysis.searchQuery}"`);
      return analysis;
    }, file);
  }

  private async withRetry(fn: () => Promise<ProductVisualAnalysis>, file: Express.Multer.File, retries = 3, delayMs = 3000): Promise<ProductVisualAnalysis> {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Quota exceeded');

      if (isRateLimit && retries > 0) {
        this.logger.warn(`Rate limit encountered (429) in Vision AI. Pausing ${delayMs / 1000}s before retry (${retries} retries left)...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.withRetry(fn, file, retries - 1, delayMs * 2);
      }

      this.logger.error('Failed to analyze image with vision model:', error.message);
      const fallbackQuery = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return {
        productName: fallbackQuery,
        brand: 'Unknown',
        category: 'General Product',
        searchQuery: fallbackQuery,
        userFeedback: `We detected your product from filename: ${fallbackQuery}`,
      };
    }
  }
}
