import app from './app';
import env from './config/env';
import logger from './utils/logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initEmailScanner } from './services/email.service';

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// Emit live feed updates every 30 seconds
setInterval(async () => {
  try {
    const { getUnifiedFeed } = await import('./services/feed.service');
    io.emit('feed:update', { data: getUnifiedFeed(), timestamp: new Date() });
  } catch { /* ignore */ }
}, 30_000);

httpServer.listen(env.PORT, () => {
  logger.info(`🚀 OmniPulse API running on http://localhost:${env.PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
  logger.info(`   Socket.IO: enabled`);
  // Auto-connect integrations
  initEmailScanner();
});

export { io };
