import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding/embedding.service';
import { RagService } from './rag/rag.service';
import { VisionService } from './vision/vision.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [forwardRef(() => ProductModule)],
  providers: [EmbeddingService, RagService, VisionService],
  exports: [EmbeddingService, RagService, VisionService],
})
export class AiModule {}
