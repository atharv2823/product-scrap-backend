// src/product/entities/scraped-product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('scraped_products')
export class ScrapedProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    platform: string; // 'amazon' | 'flipkart' | 'ajio'

    @Column()
    title: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    originalPrice: number;

    @Column({ nullable: true })
    rating: number;

    @Column()
    productUrl: string;

    @Column()
    imageUrl: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // 1536 dimensions for text-embedding-3-small or 768 for Gemini/CLIP
    @Column({ type: 'vector', length: 1536, nullable: true })
    embedding: number[];

    @CreateDateColumn()
    createdAt: Date;
}
