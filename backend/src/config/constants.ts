// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-tokens';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// OTP Configuration
export const OTP_EXPIRES_IN = 10 * 60 * 1000; // 10 minutes in milliseconds

// Database Configuration
export const USE_SQLITE = process.env.USE_SQLITE === 'true' || true;
export const SQLITE_FILE_PATH = process.env.SQLITE_FILE_PATH || './database.sqlite';
export const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
export const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
export const MYSQL_USER = process.env.MYSQL_USER || 'root';
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
export const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'auth_db';

// Server Configuration
export const PORT = process.env.PORT || 8000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
