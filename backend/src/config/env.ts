import dotenv from 'dotenv';
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/omnipulse',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Gmail
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || '',

  // Codeforces
  CODEFORCES_HANDLE: process.env.CODEFORCES_HANDLE || '',

  // LeetCode
  LEETCODE_USERNAME: process.env.LEETCODE_USERNAME || '',

  // Telegram Bot (optional)
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default env;
