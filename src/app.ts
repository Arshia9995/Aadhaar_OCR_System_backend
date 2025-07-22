import express from 'express';
import cors from 'cors';
import ocrRoutes from './routes/ocrRoutes';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/ocr', ocrRoutes);


// Error handling middleware - Add this AFTER your routes
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;
