import pgPromise from 'pg-promise';
import { config } from './environment';

const pgp = pgPromise({
  error(error, _e) {
    console.error('Database error:', error);
  },
});

export const db = pgp({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const testConnection = async () => {
  try {
    await db.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
