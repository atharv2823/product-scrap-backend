// src/product-search/product-search.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductSearchService } from './product-search.service';
import { AuthGuard } from '../guards/auth/auth.guard';
import { CurrentUser } from '../guards/auth/current-user.decorator';
import type { UserPayload } from '../guards/auth/current-user.decorator';

@Controller('product-search')
export class ProductSearchController {
  constructor(private readonly searchService: ProductSearchService) {}

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, cb) => {
        const isValidMime =
          file.mimetype.startsWith('image/') ||
          file.mimetype === 'application/octet-stream';
        const isValidExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(
          file.originalname,
        );

        if (!isValidMime && !isValidExt) {
          return cb(
            new BadRequestException(
              'Only image files are allowed (jpg, jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAndSearch(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.searchService.processImageSearch(file, user.sub);
  }

  @Post('text')
  @UseGuards(AuthGuard)
  async searchByText(
    @Body('query') query: string,
    @CurrentUser() user: UserPayload,
  ) {
    if (!query) throw new BadRequestException('Query string is required');
    return this.searchService.processTextSearch(query, user.sub);
  }

  // ==========================================
  // 🔒 PROTECTED ROUTES: User Search History
  // ==========================================

  @UseGuards(AuthGuard)
  @Get('history')
  async getSearchHistory(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.searchService.getUserSearchHistory(user.sub, +limit, +offset);
  }

  @UseGuards(AuthGuard)
  @Get('history/:id')
  async getSearchHistoryDetail(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    const search = await this.searchService.getUserSearchById(id, user.sub);
    if (!search) {
      throw new NotFoundException(`Search record with ID ${id} not found`);
    }
    return search;
  }

  @UseGuards(AuthGuard)
  @Delete('history')
  async clearSearchHistory(@CurrentUser() user: UserPayload) {
    return this.searchService.clearUserSearchHistory(user.sub);
  }
}
