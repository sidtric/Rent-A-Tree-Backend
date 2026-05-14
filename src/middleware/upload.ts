import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'yourorchard/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] } as any,
});

const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (_req: any, file: any) => ({
    folder: 'yourorchard/media',
    resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
  }) as any,
});

const heroMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (_req: any, file: any) => ({
    folder: 'yourorchard/hero',
    resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
  }) as any,
});

export const uploadImage      = multer({ storage: imageStorage,      limits: { fileSize: 10  * 1024 * 1024 } });
export const uploadMedia      = multer({ storage: mediaStorage,      limits: { fileSize: 100 * 1024 * 1024 } });
export const uploadHeroMedia  = multer({ storage: heroMediaStorage,  limits: { fileSize: 500 * 1024 * 1024 } });
