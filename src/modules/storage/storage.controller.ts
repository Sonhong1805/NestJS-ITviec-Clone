import { Public } from 'src/commons/decorators/public.decorator';
import { StorageService } from './storage.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadFileDto } from './dto/upload-file.dto';
import { validateCVFile } from 'src/commons/utils/validateCVFile';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Post('upload/image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const validMineType = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMineType.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid mine type. only images are allowed',
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 5MB');
    }

    const filePath = `/images/${Date.now()}/${file.originalname}`;
    const uploadResult = this.storageService.uploadFile(filePath, file.buffer);
    const publicUrl = await this.storageService.getSignedUrl(
      (await uploadResult).path,
    );
    return {
      message: 'Image uploaded successfully',
      result: {
        publicUrl,
        path: (await uploadResult).path,
      },
    };
  }
  @Public()
  @Post('upload/cv')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  async uploadCV(@UploadedFile() file: Express.Multer.File) {
    const { contentType } = validateCVFile(file);

    const filePath = `/cvs/${Date.now()}/${file.originalname}`;
    const uploadResult = this.storageService.uploadFile(filePath, file.buffer, {
      upsert: true,
      contentType,
    });
    const publicUrl = await this.storageService.getSignedUrl(
      (await uploadResult).path,
    );
    return {
      message: 'Uploaded successfully',
      result: {
        publicUrl,
        path: (await uploadResult).path,
      },
    };
  }

  @Public()
  @Delete('delete')
  async deleteFile(@Body() body: { key: string }) {
    await this.storageService.deleteFile(body.key);
    return {
      message: 'Deleted file successfully',
    };
  }
}
