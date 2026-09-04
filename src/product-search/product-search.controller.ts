// src/product-search/product-search.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductSearchService } from './product-search.service';

@Controller('product-search')
export class ProductSearchController {
    constructor(private readonly searchService: ProductSearchService) { }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
        fileFilter: (req, file, cb) => {
            const isValidMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
            const isValidExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname);

            if (!isValidMime && !isValidExt) {
                return cb(new BadRequestException('Only image files are allowed (jpg, jpeg, png, webp)'), false);
            }
            cb(null, true);
        },
    }))
    async uploadAndSearch(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Image file is required');
        return this.searchService.processImageSearch(file);
    }

    @Post('text')
    async searchByText(@Body('query') query: string) {
        if (!query) throw new BadRequestException('Query string is required');
        return this.searchService.processTextSearch(query);
    }
}
