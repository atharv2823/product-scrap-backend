import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding/embedding.service';
import { RagService } from './rag/rag.service';

@Module({
  providers: [EmbeddingService, RagService]
})
export class AiModule {}
