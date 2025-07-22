import fs from 'fs';

export const removeFiles = (path: string) => {
  fs.unlink(path, err => {
    if (err) console.error('Error deleting file:', path);
  });
};
