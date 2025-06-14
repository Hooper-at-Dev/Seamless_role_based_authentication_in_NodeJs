import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../utils/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  credits: number;
}

const UserCreditManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      setUsers(response.users);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setNewCredits(user.credits.toString());
    setReason('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;

    try {
      await api.updateUserCredits(selectedUser.id, parseInt(newCredits), reason);
      
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, credits: parseInt(newCredits) } 
          : user
      ));
      
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update credits');
      console.error(err);
    }
  };

  if (loading) return <Typography>Loading users...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        User Credit Management
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.credits}</TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleOpenDialog(user)}
                  >
                    Edit Credits
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Credit Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update User Credits</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              User: {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Credits: {selectedUser?.credits}
            </Typography>
            
            <TextField
              label="New Credits"
              type="number"
              fullWidth
              value={newCredits}
              onChange={(e) => setNewCredits(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <TextField
              label="Reason for Change (optional)"
              fullWidth
              multiline
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateCredits} 
            variant="contained" 
            color="primary"
            disabled={!newCredits || isNaN(parseInt(newCredits)) || parseInt(newCredits) < 0}
          >
            Update Credits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserCreditManager; 