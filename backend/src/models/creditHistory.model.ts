import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

class CreditHistory extends Model {
  public id!: number;
  public userId!: number;
  public adminId!: number;
  public previousCredits!: number;
  public newCredits!: number;
  public reason!: string;
  public readonly createdAt!: Date;
}

CreditHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    adminId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    previousCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'CreditHistory',
    tableName: 'credit_history',
    timestamps: true,
    updatedAt: false,
  }
);

export default CreditHistory; 