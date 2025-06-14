import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import User, { UserRole } from './models/user.model';

// Load environment variables first
dotenv.config();

// Import models to register them before database sync
import './models/user.model';

// Import database connection
import sequelize from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import locationRoutes from './routes/location.routes';

// Import passport configuration
import './config/passport';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Sync database with models
const initializeDatabase = async () => {
  try {
    const syncOptions = { force: false }; // This will not try to alter tables but only create if missing

    await sequelize.sync(syncOptions);
    console.log('Database models synchronized successfully. Tables created if they didn\'t exist.');
    
    // Check if prime admin exists
    await checkPrimeAdmin();
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

// Function to check if a prime admin exists and log the status
const checkPrimeAdmin = async () => {
  try {
    const primeAdmin = await User.findOne({ where: { role: UserRole.PRIME_ADMIN } });
    if (primeAdmin) {
      console.log(`Prime Admin exists: ${primeAdmin.email}`);
    } else {
      console.log('No Prime Admin account found. Create one using /api/auth/register-prime-admin route.');
    }
  } catch (error) {
    console.error('Error checking prime admin:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start the server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;