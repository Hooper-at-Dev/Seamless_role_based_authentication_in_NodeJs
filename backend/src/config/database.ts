import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbName = process.env.DB_NAME || 'auth_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'password';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

// When true, uses SQLite instead of MySQL
const useSQLite = process.env.USE_SQLITE === 'true';
// File path for SQLite database (used when useSQLite is true)
const sqliteFilePath = process.env.SQLITE_FILE_PATH || path.join(__dirname, '../../database.sqlite');

let sequelize: Sequelize;

if (useSQLite) {
  console.log(`Using file-based SQLite database at: ${sqliteFilePath}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteFilePath, // File-based storage instead of in-memory
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  console.log('Using MySQL database connection');
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    if (!useSQLite) {
      console.log('Please make sure your MySQL server is running and accessible with the provided credentials.');
      console.log('You can set USE_SQLITE=true in your .env file to use a file-based SQLite database instead.');
    }
  }
};

testConnection();

export default sequelize;