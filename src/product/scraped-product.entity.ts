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

    // 3072 dimensions for Gemini gemini-embedding-001
    @Column({ type: 'vector', length: 3072, nullable: true })
    embedding: number[];

    @CreateDateColumn()
    createdAt: Date;
}
