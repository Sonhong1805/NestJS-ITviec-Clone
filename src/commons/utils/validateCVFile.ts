import { BadRequestException } from '@nestjs/common';

export function validateCVFile(file: Express.Multer.File) {
  const validFileTypes = ['pdf', 'docx', 'doc'];
  const validContentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
  };

  const [_, fileType] = file.originalname.split('.');
  if (!validFileTypes.includes(fileType)) {
    throw new BadRequestException(
      'Invalid mine type. only pdf, doc, docx file are allowed',
    );
  }

  const maxSizeBytes = 3 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new BadRequestException('File size exceeds the 3MB');
  }

  return {
    contentType: validContentTypes[fileType],
  };
}
