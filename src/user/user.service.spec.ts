import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if email already exists', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      } as User);

      await expect(
        service.create({ email: 'test@example.com', firstName: 'John' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and return user if email does not exist', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      const newUser = { id: '1', email: 'new@example.com', firstName: 'Jane' } as User;
      jest.spyOn(repo, 'create').mockReturnValue(newUser);
      jest.spyOn(repo, 'save').mockResolvedValue(newUser);

      const result = await service.create({
        email: 'new@example.com',
        firstName: 'Jane',
      });
      expect(result).toEqual(newUser);
    });
  });
});

