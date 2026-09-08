import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatQueryDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
