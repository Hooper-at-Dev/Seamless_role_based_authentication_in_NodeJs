import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class DropoffLocation extends Model {
  public id!: number;
  public name!: string;
  public address!: string;
  public latitude!: number;
  public longitude!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DropoffLocation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'DropoffLocation',
    tableName: 'dropoff_locations',
  }
);

export default DropoffLocation;
