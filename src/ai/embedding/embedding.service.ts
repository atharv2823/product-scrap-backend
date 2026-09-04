// src/ai/embedding.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbeddingService {
    private embeddings: OpenAIEmbeddings;

    constructor(private configService: ConfigService) {
        this.embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small', // 1536 dimensions
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        return await this.embeddings.embedQuery(text);
    }
}
