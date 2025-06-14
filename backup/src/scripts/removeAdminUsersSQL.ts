import sequelize from '../config/database';
import { UserRole } from '../models/user.model';

async function removeAdminUsersSQL() {
  try {
    console.log('Starting admin user removal with SQL...');
    
    // Use raw SQL query to delete admin and prime_admin users
    const [results, metadata] = await sequelize.query(
      `DELETE FROM users WHERE role IN ('admin', 'prime_admin')`
    );
    
    console.log(`Successfully removed admin users. Affected rows: ${metadata}`);
    
  } catch (error) {
    console.error('Error executing SQL:', error);
  } finally {
    process.exit(0);
  }
}

removeAdminUsersSQL(); 