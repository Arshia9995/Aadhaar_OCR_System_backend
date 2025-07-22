import { Request, Response, NextFunction } from 'express';
import { MulterRequest } from '../utility/types';
import { removeFiles } from '../utility/removeFiles';
import { isAdhaar, validateFiles } from '../utility/validation';
import { createWorker } from 'tesseract.js';
import { generateData } from '../utility/extractData';
import { HttpStatusCode } from '../utility/enum';

export const ocrController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adhaarBackFile, adhaarFrontFile } = (req as MulterRequest).files ?? {};

    validateFiles((req as MulterRequest).files);

    const worker = await createWorker('eng', 1);
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,-:/',
    });

    const { data: { text: frontText } } = await worker.recognize(adhaarFrontFile![0].path);
    const { data: { text: backText } } = await worker.recognize(adhaarBackFile![0].path);
    console.log(frontText, backText, "here" )

    isAdhaar(frontText, backText);

    const parsedData = generateData(frontText, backText);
    await worker.terminate();

    removeFiles(adhaarFrontFile![0].path);
    removeFiles(adhaarBackFile![0].path);

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      message: 'data extracted successfully',
      data: parsedData,
    });
  } catch (error) {
    next(error);
  }
};
