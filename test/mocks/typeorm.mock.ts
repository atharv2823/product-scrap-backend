import { Inject } from '@nestjs/common';

export function getRepositoryToken(entity: any): string {
  if (!entity) return 'Repository';
  if (typeof entity === 'string') return entity;
  return `${entity.name || 'Entity'}Repository`;
}

export function InjectRepository(entity: any) {
  return Inject(getRepositoryToken(entity));
}

export const TypeOrmModule = {
  forRoot: () => ({ module: class TypeOrmModule {} }),
  forFeature: () => ({ module: class TypeOrmModule {} }),
  forRootAsync: () => ({ module: class TypeOrmModule {} }),
};
