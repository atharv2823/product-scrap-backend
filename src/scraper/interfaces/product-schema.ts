// src/scraper/interfaces/product-schema.ts
import { z } from 'zod';

export const ScrapedProductItemSchema = z.object({
  platform: z
    .enum(['amazon', 'flipkart', 'ajio'])
    .optional()
    .describe('The platform this product listing belongs to'),
  title: z.string().describe('Full title of the product'),
  price: z
    .number()
    .describe('Current selling price in INR (numbers only, remove symbols)'),
  originalPrice: z
    .number()
    .optional()
    .describe('MRP or strikethrough price before discount'),
  rating: z.number().optional().describe('Star rating out of 5 (e.g. 4.2)'),
  productUrl: z
    .string()
    .describe('Direct link or relative link to the product page'),
  imageUrl: z.string().describe('URL to the product image'),
  inStock: z
    .boolean()
    .default(true)
    .describe('Whether the product is currently in stock'),
});

export const ScrapedProductListSchema = z.object({
  products: z
    .array(ScrapedProductItemSchema)
    .describe('List of matched products found on the page'),
});

export type ScrapedProductItem = z.infer<typeof ScrapedProductItemSchema>;
