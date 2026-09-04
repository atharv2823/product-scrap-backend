import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Injectable()
export class EmbeddingService {
    private embeddings: GoogleGenerativeAIEmbeddings;

    constructor(private configService: ConfigService) {
        const apiKey =
            this.configService.get<string>('GEMINI_API_KEY') ||
            this.configService.get<string>('OPENAI_API_KEY');

        this.embeddings = new GoogleGenerativeAIEmbeddings({
            model: 'gemini-embedding-001', // 3072 dimensions
            apiKey: apiKey,
        });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        return await this.embeddings.embedQuery(text);
    }
}
