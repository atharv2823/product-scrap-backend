# Project Instructions & Context Protocol

## Primary Directive
Before performing any task, writing new code, running commands, or modifying existing features in this project:
1. **Always read `DEVELOPMENT.md`** first to load the full architectural context, modules, entities, and data flows.
2. Maintain the established NestJS modular structure:
   - `src/product-search/` for image upload and visual search orchestration.
   - `src/scraper/` for multi-platform web scraping (Amazon, Flipkart, Ajio) and LangChain structured extraction (`withStructuredOutput` + Zod).
   - `src/product/` for database entities and `pgvector` similarity operations.
   - `src/ai/` for embeddings generation (`text-embedding-3-small`) and LangChain RAG pipelines.
   - `src/chat/` for the conversational shopping assistant endpoints.
3. **Dependency Rules**:
   - Never upgrade `zod` to v4 (keep `zod@^3.25.x` to prevent LangChain/npm `ERESOLVE` conflicts).
   - Maintain circular dependency handling between `ProductModule` and `AiModule` using `forwardRef(() => ...)` and `@Inject(forwardRef(() => ...))`.
