// src/product-search/product-search.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductSearchService } from './product-search.service';

@Controller('product-search')
export class ProductSearchController {
    constructor(private readonly searchService: ProductSearchService) { }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                return cb(new BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    }))
    async uploadAndSearch(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Image file is required');
        return this.searchService.processImageSearch(file);
    }
}
