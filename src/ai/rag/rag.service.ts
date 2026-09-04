import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ProductService } from '../../product/product.service';

@Injectable()
export class RagService {
    private llm: ChatGoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => ProductService))
        private productService: ProductService,
    ) {
        const apiKey =
            this.configService.get<string>('GEMINI_API_KEY') ||
            this.configService.get<string>('OPENAI_API_KEY');

        this.llm = new ChatGoogleGenerativeAI({
            model: 'gemini-3.6-flash',
            temperature: 0.2,
            apiKey: apiKey,
        });
    }

    async answerShoppingQuery(userQuestion: string) {
        // 1. Retrieve top 6 most relevant products from pgvector
        const matchedProducts = await this.productService.searchSimilar(userQuestion, 6);

        // 2. Format products into RAG context
        const context = matchedProducts
            .map(
                (p) => `
- Platform: ${p.platform.toUpperCase()}
  Title: ${p.title}
  Price: ₹${p.price} (Original: ₹${p.originalPrice || 'N/A'})
  Rating: ${p.rating ? `${p.rating} ★` : 'N/A'}
  Link: ${p.productUrl}
  Image: ${p.imageUrl}
`,
            )
            .join('\n');

        // 3. Prompt Template enforcing accurate comparison
        const prompt = ChatPromptTemplate.fromMessages([
            [
                'system',
                `You are an expert AI shopping assistant and price comparison advisor.
Use the following retrieved products to answer the user's question:

{context}

Guidelines:
1. Compare prices across platforms (Amazon, Flipkart, Ajio) and clearly state which is the cheapest.
2. Provide direct clickable markdown links [Buy on Platform](url).
3. If no products match, tell the user politely to try searching with another keyword or image.
4. Keep the tone helpful and concise.`,
            ],
            ['human', '{question}'],
        ]);

        const chain = RunnableSequence.from([
            prompt,
            this.llm,
            new StringOutputParser(),
        ]);

        return await chain.invoke({
            context,
            question: userQuestion,
        });
    }
}
