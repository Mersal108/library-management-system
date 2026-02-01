import app from './app';
import { config } from './config/environment';
import { testConnection } from './config/database';

const startServer = async () => {
  try {
    await testConnection();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
