import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';

// Helper function to generate 8-digit unique ID for regular users
function generateUniqueId() {
  // Generate a random 8-digit number (between 10000000 and 99999999)
  return Math.floor(10000000 + Math.random() * 90000000);
}

// Helper function to generate 10-digit unique ID for admin accounts
function generateAdminId() {
  // Generate a random 10-digit number (between 1000000000 and 9999999999)
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

// Define user roles as an enum for type safety
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PRIME_ADMIN = 'prime_admin'
}

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public googleId!: string | null;
  public isVerified!: boolean;
  public otpSecret!: string | null;
  public otpExpiration!: Date | null;
  public role!: UserRole;
  public credits!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Compare password method
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Check if user is admin
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.PRIME_ADMIN;
  }

  // Check if user is prime admin
  public isPrimeAdmin(): boolean {
    return this.role === UserRole.PRIME_ADMIN;
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT, // Change to BIGINT to accommodate both 8 and 10 digit IDs
      primaryKey: true,
      allowNull: false,
      defaultValue: generateUniqueId,
      unique: true,
      validate: {
        isInt: true,
        min: 10000000, // Min 8 digits
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null for Google OAuth users
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otpSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      // Hash password before save
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        
        // Generate ID based on role
        let newId;
        
        // Admins and Prime Admins get 10-digit IDs
        if (user.role === UserRole.ADMIN || user.role === UserRole.PRIME_ADMIN) {
          newId = user.id || generateAdminId();
        } else {
          // Regular users get 8-digit IDs
          newId = user.id || generateUniqueId();
        }
        
        // Ensure ID is unique - keep trying until we find a unique one
        let existingUser;
        
        do {
          existingUser = await User.findByPk(newId);
          if (existingUser) {
            // Generate a new ID based on role
            if (user.role === UserRole.ADMIN || user.role === UserRole.PRIME_ADMIN) {
              newId = generateAdminId();
            } else {
              newId = generateUniqueId();
            }
          }
        } while (existingUser);
        
        user.id = newId;
        
        // Set default credits for new regular users
        if (user.role === UserRole.USER) {
          user.credits = 500;
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User; 