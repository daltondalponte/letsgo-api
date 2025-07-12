import { Controller, Get, Post, Query, UploadedFile, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import sharp from 'sharp';

// Configurações do Cloudflare R2
const CLOUDFLARE_CONFIG = {
  accountId: 'd0966b8c9dc94cd73c466c563dab7a66',
  bucketName: 'letsgo-images',
  endpoint: 'https://d0966b8c9dc94cd73c466c563dab7a66.r2.cloudflarestorage.com',
  accessKeyId: '496297cfaacf1a28a51dcb803db187f0',
  secretAccessKey: '012d556a5a658135e4529d2e9794b3be4aa47ef7a892cc3d825aed68112afa7d',
};

const s3Client = new S3Client({
  region: 'auto',
  endpoint: CLOUDFLARE_CONFIG.endpoint,
  credentials: {
    accessKeyId: CLOUDFLARE_CONFIG.accessKeyId,
    secretAccessKey: CLOUDFLARE_CONFIG.secretAccessKey,
  },
});

@Controller('api')
export class ImageController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Arquivo não enviado' });
    }

    try {
      // Comprimir imagem usando Sharp
      const compressedBuffer = await sharp(file.buffer)
        .resize(960, 720, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 75 }) // Qualidade melhorada para 75%
        .toBuffer();

      const ext = 'jpg'; // Sempre usar JPG para melhor compressão
      const fileName = `events/${Date.now()}-${uuidv4()}.${ext}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: CLOUDFLARE_CONFIG.bucketName,
        Key: fileName,
        Body: compressedBuffer,
        ContentType: 'image/jpeg',
      }));

      return res.status(HttpStatus.OK).json({ 
        url: `/api/image-proxy?file=${encodeURIComponent(fileName)}`,
        fileName: fileName,
        originalSize: file.size,
        compressedSize: compressedBuffer.length
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Erro ao fazer upload', details: error });
    }
  }

  @Get('image-proxy')
  async getImage(@Query('file') file: string, @Res() res: Response) {
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Parâmetro file é obrigatório' });
    }
    try {
      const command = new GetObjectCommand({
        Bucket: CLOUDFLARE_CONFIG.bucketName,
        Key: file,
      });
      const response = await s3Client.send(command);
      if (!response.Body) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Imagem não encontrada' });
      }
      res.setHeader('Content-Type', response.ContentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      for await (const chunk of response.Body as any) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Erro ao buscar imagem', details: error });
    }
  }
} 