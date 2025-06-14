import express from 'express';
import DropoffLocation from '../models/dropoffLocation.model';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Get all dropoff locations (admin only)
router.get('/dropoff-locations', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const locations = await DropoffLocation.findAll({
      attributes: ['id', 'name', 'address', 'latitude', 'longitude'],
      order: [['name', 'ASC']],
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching dropoff locations:', error);
    res.status(500).json({ message: 'Failed to fetch dropoff locations' });
  }
});

// Add a new dropoff location (admin only)
router.post('/dropoff-locations', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'All fields are required: name, address, latitude, longitude' });
    }
    
    // Create new location
    const location = await DropoffLocation.create({
      name,
      address,
      latitude,
      longitude
    });
    
    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating dropoff location:', error);
    res.status(500).json({ message: 'Failed to create dropoff location' });
  }
});

// Update a dropoff location (admin only)
router.put('/dropoff-locations/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude } = req.body;
    
    // Find the location
    const location = await DropoffLocation.findByPk(id);
    
    if (!location) {
      return res.status(404).json({ message: 'Dropoff location not found' });
    }
    
    // Update fields
    if (name) location.name = name;
    if (address) location.address = address;
    if (latitude !== undefined) location.latitude = latitude;
    if (longitude !== undefined) location.longitude = longitude;
    
    await location.save();
    
    res.json(location);
  } catch (error) {
    console.error('Error updating dropoff location:', error);
    res.status(500).json({ message: 'Failed to update dropoff location' });
  }
});

// Delete a dropoff location (admin only)
router.delete('/dropoff-locations/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the location
    const location = await DropoffLocation.findByPk(id);
    
    if (!location) {
      return res.status(404).json({ message: 'Dropoff location not found' });
    }
    
    // Delete the location
    await location.destroy();
    
    res.json({ message: 'Dropoff location deleted successfully' });
  } catch (error) {
    console.error('Error deleting dropoff location:', error);
    res.status(500).json({ message: 'Failed to delete dropoff location' });
  }
});

export default router;
