import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import workspaceRoutes from './routes/workspace.routes';
import { AppError } from './utils/errors';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/workspaces', workspaceRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`✅ RoleGuard Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Profile API: http://localhost:${PORT}/api/profile`);
  console.log(`🏢 Workspace API: http://localhost:${PORT}/api/workspaces`);
});