import User, { UserRole } from '../models/user.model';
import sequelize from '../config/database';
import dotenv from 'dotenv';

// Reload environment variables
dotenv.config();

async function verifyDbConfig() {
  try {
    console.log("Checking database configuration:");
    console.log(`USE_SQLITE env var: ${process.env.USE_SQLITE}`);
    console.log(`SQLITE_FILE_PATH env var: ${process.env.SQLITE_FILE_PATH}`);
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Check for prime admin
    const admin = await User.findOne({
      where: { email: 'sarthaknsanjeev@gmail.com' }
    });
    
    if (admin) {
      console.log('Prime admin found:');
      console.log(`ID: ${admin.id}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`isVerified: ${admin.isVerified}`);
    } else {
      console.log('Prime admin not found. Creating it now...');
      
      // Create prime admin
      const primeAdmin = await User.create({
        email: 'sarthaknsanjeev@gmail.com',
        password: 'sarthak',
        firstName: 'Sarthak',
        lastName: 'Admin',
        role: UserRole.PRIME_ADMIN,
        isVerified: true
      });
      
      console.log('Prime admin created successfully!');
      console.log(`ID: ${primeAdmin.id}`);
      console.log(`Email: ${primeAdmin.email}`);
      console.log(`Role: ${primeAdmin.role}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyDbConfig();
