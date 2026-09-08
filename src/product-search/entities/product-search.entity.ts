import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/user.entity';

@Entity('product_searches')
export class ProductSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ length: 50, default: 'text' })
  searchType: string; // 'image' | 'text'

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'text', nullable: true })
  userFeedback?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  analysis?: Record<string, any> | null;

  @Column({ default: 0 })
  totalFound: number;

  @Column({ type: 'jsonb', nullable: true })
  results?: Record<string, any>[] | null;

  @CreateDateColumn()
  createdAt: Date;
}
