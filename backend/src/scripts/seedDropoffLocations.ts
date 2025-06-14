import DropoffLocation from '../models/dropoffLocation.model';
import sequelize from '../config/database';

async function seedDropoffLocations() {
  try {
    await sequelize.sync();

    const locations = [
      {
        name: 'Main Train Station',
        address: '123 Railway Rd, City Center',
        latitude: 12.3456,
        longitude: 98.7654,
      },
      {
        name: 'Airport Terminal',
        address: '456 Airport Blvd, Airport Zone',
        latitude: 12.3789,
        longitude: 98.7321,
      },
      {
        name: 'Central Bus Station',
        address: '789 Transit St, Downtown',
        latitude: 12.3123,
        longitude: 98.7456,
      },
    ];

    await DropoffLocation.bulkCreate(locations);
    console.log('Dropoff locations seeded successfully!');
  } catch (error) {
    console.error('Error seeding dropoff locations:', error);
  } finally {
    await sequelize.close();
  }
}

seedDropoffLocations();
