import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async create(userData: Partial<User> ):Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findAll():Promise<User[]>{
        return this.userRepository.find();
    }

    async findOne(id: number):Promise<User>{
        const user = await this.userRepository.findOneBy({id});
        if(!user){
            throw new NotFoundException("Employee not found");
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }


}
