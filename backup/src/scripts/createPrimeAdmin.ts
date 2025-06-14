import User, { UserRole } from '../models/user.model';
import sequelize from '../config/database';

async function createPrimeAdmin() {
  try {
    // Initialize database
    await sequelize.sync();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'sarthaknsanjeev@gmail.com'
      }
    });
    
    if (existingAdmin) {
      console.log('Prime admin already exists!');
      return;
    }
    
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
    
  } catch (error) {
    console.error('Error creating prime admin:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Execute the function
createPrimeAdmin();
