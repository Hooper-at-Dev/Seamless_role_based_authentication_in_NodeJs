import sequelize from '../config/database';
import User, { UserRole } from '../models/user.model';

async function addCreditsColumn() {
  try {
    console.log('Starting migration: Adding credits column to users table...');
    
    // Check if the column already exists
    const [checkResults] = await sequelize.query(
      `PRAGMA table_info(users);`
    );
    
    // @ts-ignore
    const columnExists = checkResults.some(col => col.name === 'credits');
    
    if (columnExists) {
      console.log('Credits column already exists. Skipping column creation.');
    } else {
      // Add the credits column
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 0;`
      );
      console.log('Credits column added successfully.');
    }
    
    // Update model to include the credits field
    console.log('Updating all non-admin users to have 500 credits...');
    
    // Update all non-admin users to have 500 credits
    const [updateResults, metadata] = await sequelize.query(
      `UPDATE users SET credits = 500 WHERE role = '${UserRole.USER}';`
    );
    
    console.log(`Successfully updated credits for non-admin users. Affected rows: ${metadata}`);
    console.log('Migration completed successfully.');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
addCreditsColumn(); 