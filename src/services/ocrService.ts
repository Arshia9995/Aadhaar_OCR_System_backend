import Tesseract from 'tesseract.js';

export const processImage = async (imagePath: string): Promise<string> => {
  const result = await Tesseract.recognize(imagePath, 'eng');
  return result.data.text;
};
