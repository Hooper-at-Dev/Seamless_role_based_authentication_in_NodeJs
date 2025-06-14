import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/user.model';

// Load environment variables
dotenv.config();

// Function to remove admin users
async function removeAdminUsers() {
  try {
    console.log('Starting admin user removal process...');
    
    // Find all admin and prime_admin users
    const adminUsers = await User.findAll({
      where: {
        role: [UserRole.ADMIN, UserRole.PRIME_ADMIN]
      }
    });
    
    console.log(`Found ${adminUsers.length} admin users to remove.`);
    
    // Display the admin users that will be removed
    for (const user of adminUsers) {
      console.log(`Will remove: ${user.email} (${user.role})`);
    }
    
    // Remove admin users
    const deleted = await User.destroy({
      where: {
        role: [UserRole.ADMIN, UserRole.PRIME_ADMIN]
      }
    });
    
    console.log(`Successfully removed ${deleted} admin users from the database.`);
    console.log('User table now contains only regular users.');
    
  } catch (error) {
    console.error('Error removing admin users:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the function
removeAdminUsers(); 