import { Request } from 'express';

export interface MulterRequest extends Request {
  files?: {
    adhaarFrontFile: Express.Multer.File[];
    adhaarBackFile: Express.Multer.File[];
  };
  imagepath?: {
    frontImage: string;
    backImage: string;
  };
}
