import { z } from 'zod';

export const ProductVisualAnalysisSchema = z.object({
  productName: z
    .string()
    .describe('Precise name and model of the product identified in the image'),
  brand: z
    .string()
    .describe(
      'Brand name if recognized (e.g. Nike, Apple, Samsung, Puma), otherwise "Unknown"',
    ),
  category: z
    .string()
    .describe(
      'General product category (e.g. Footwear, Smartphone, T-shirt, Watch, Backpack)',
    ),
  color: z.string().optional().describe('Dominant colors of the product'),
  searchQuery: z
    .string()
    .describe(
      'Clean, high-accuracy e-commerce search query (3 to 6 words) optimized for searching Amazon, Flipkart, or Ajio without special characters',
    ),
  userFeedback: z
    .string()
    .describe(
      'A friendly, informative message explaining what product was detected, key visual details, and what we are searching for',
    ),
});

export type ProductVisualAnalysis = z.infer<typeof ProductVisualAnalysisSchema>;
