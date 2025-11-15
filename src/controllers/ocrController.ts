// import { Request, Response, NextFunction } from 'express';
// import { MulterRequest } from '../utility/types';
// import { removeFiles } from '../utility/removeFiles';
// import { isAdhaar, validateFiles } from '../utility/validation';
// import { createWorker } from 'tesseract.js';
// import { generateData } from '../utility/extractData';
// import { HttpStatusCode } from '../utility/enum';

// export const ocrController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { adhaarBackFile, adhaarFrontFile } = (req as MulterRequest).files ?? {};

//     validateFiles((req as MulterRequest).files);

//     const worker = await createWorker('eng', 1);
//     await worker.setParameters({
//       tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,-:/',
//     });

//     const { data: { text: frontText } } = await worker.recognize(adhaarFrontFile![0].path);
//     const { data: { text: backText } } = await worker.recognize(adhaarBackFile![0].path);
//     console.log(frontText, backText, "here" )

//     isAdhaar(frontText, backText);

//     const parsedData = generateData(frontText, backText);
//     await worker.terminate();

//     removeFiles(adhaarFrontFile![0].path);
//     removeFiles(adhaarBackFile![0].path);

//     res.status(HttpStatusCode.OK).json({
//       status: 'success',
//       message: 'data extracted successfully',
//       data: parsedData,
//     });
//   } catch (error) {
//     next(error);
//   }
// };




import { Request, Response, NextFunction } from 'express';
import { MulterRequest } from '../utility/types';
import { removeFiles } from '../utility/removeFiles';
import { isAdhaar, validateFiles } from '../utility/validation';
import { createWorker } from 'tesseract.js';
import { generateData } from '../utility/extractData';
import { HttpStatusCode } from '../utility/enum';
import crypto from 'crypto';
import { AadhaarData } from '../models/AdhaarModel';

export const ocrController = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  let filePaths: string[] = [];
  
  try {
    const { adhaarBackFile, adhaarFrontFile } = (req as MulterRequest).files ?? {};
    
    // Store file paths for cleanup
    if (adhaarFrontFile?.[0]?.path) filePaths.push(adhaarFrontFile[0].path);
    if (adhaarBackFile?.[0]?.path) filePaths.push(adhaarBackFile[0].path);

    // Validate files exist and meet basic requirements
    validateFiles((req as MulterRequest).files);

    // Additional security validations
    await validateFilesSecurity(adhaarFrontFile?.[0], adhaarBackFile?.[0]);

    const worker = await createWorker('eng', 1);
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,-:/.()[]',
    });

    const { data: { text: frontText } } = await worker.recognize(adhaarFrontFile![0].path);
    const { data: { text: backText } } = await worker.recognize(adhaarBackFile![0].path);
    
    console.log('OCR extraction completed successfully');

    // Enhanced Aadhaar validation
    const validationResult = await isAdhaar(frontText, backText);
    if (!validationResult.isValid) {
      throw new Error(validationResult.reason || 'Invalid Aadhaar card images');
    }

    // Extract and validate data
    const parsedData: AadhaarData = generateData(frontText, backText);
    
    // Additional data validation
    validateExtractedData(parsedData);

    await worker.terminate();

    // Sanitize response data (mask sensitive information)
    const sanitizedData = sanitizeAadhaarData(parsedData);

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      message: 'Data extracted successfully',
      data: sanitizedData,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    next(error);
  } finally {
    // Secure cleanup - overwrite and delete files
    await secureCleanup(filePaths);
  }
};

// Enhanced file security validation
async function validateFilesSecurity(frontFile: any, backFile: any) {
  const maxFileSize = 10 * 1024 * 1024; // 10MB limit
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!frontFile || !backFile) {
    throw new Error('Both front and back images are required');
  }

  // File size validation
  if (frontFile.size > maxFileSize || backFile.size > maxFileSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  // MIME type validation
  if (!allowedTypes.includes(frontFile.mimetype) || !allowedTypes.includes(backFile.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
  }

  // File extension validation
  const frontExt = frontFile.originalname.split('.').pop()?.toLowerCase();
  const backExt = backFile.originalname.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  if (!frontExt || !backExt || !allowedExtensions.includes(frontExt) || !allowedExtensions.includes(backExt)) {
    throw new Error('Invalid file extension');
  }
}

// Sanitize Aadhaar data for response
function sanitizeAadhaarData(data: any) {
  return {
    ...data,
    // Mask Aadhaar number (show only last 4 digits)
    aadhaarNumber: data.aadhaarNumber ? 
      `XXXX-XXXX-${data.aadhaarNumber.slice(-4)}` : '',
    // Keep other fields as is for now, but consider masking based on requirements
  };
}

// Validate extracted data quality
function validateExtractedData(data: any) {
  const errors: string[] = [];

  // Name validation
  if (!data.name || data.name.length < 2) {
    errors.push('Invalid or missing name');
  }

  // Aadhaar number validation (should be 12 digits)
  if (!data.aadhaarNumber || !/^\d{12}$/.test(data.aadhaarNumber.replace(/\s|-/g, ''))) {
    errors.push('Invalid Aadhaar number format');
  }

  // DOB validation
  if (!data.dob || !/^\d{2}\/\d{2}\/\d{4}$/.test(data.dob)) {
    errors.push('Invalid date of birth format');
  }

  // Gender validation
  if (!data.gender || !['male', 'female'].includes(data.gender.toLowerCase())) {
    errors.push('Invalid or missing gender');
  }

  // Pincode validation (6 digits)
  if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
    errors.push('Invalid pincode format');
  }

  if (errors.length > 0) {
    throw new Error(`Data validation failed: ${errors.join(', ')}`);
  }
}

// Secure file cleanup
async function secureCleanup(filePaths: string[]) {
  const fs = require('fs').promises;
  
  for (const filePath of filePaths) {
    try {
      // Overwrite file with random data before deletion
      const stats = await fs.stat(filePath);
      const randomData = crypto.randomBytes(stats.size);
      await fs.writeFile(filePath, randomData);
      
      // Delete the file
      await fs.unlink(filePath);
      console.log(`Securely cleaned up: ${filePath}`);
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
}