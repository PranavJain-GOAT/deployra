import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';
import env from './config/env';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiLimiter);
app.use('/api/v1', routes);

app.get('/', (_, res) => res.json({ service: 'OmniPulse Backend', version: '1.0.0', status: 'running' }));
app.use(notFound);
app.use(errorHandler);

export default app;
