import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding/embedding.service';
import { RagService } from './rag/rag.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [forwardRef(() => ProductModule)],
  providers: [EmbeddingService, RagService],
  exports: [EmbeddingService, RagService],
})
export class AiModule {}
