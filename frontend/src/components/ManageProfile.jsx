import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../styles/ManageProfile.css';

const ManageProfile = ({ show, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/fetchuserprofile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setName(data.team_name || '');  
      setPhone(data.phone_number || '');  
      setAddress(data.address || ''); 
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const storeSavedChanges = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/updateuserprofile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone,
          address: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const result = await response.json();
      console.log('Profile updated successfully:', result);
      // Optionally, you can show a success message or perform additional actions
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/deleteuserprofile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      const result = await response.json();
      console.log('Account deleted successfully:', result);

      // Clear the token from session storage
      sessionStorage.removeItem('authToken');

      // Navigate to login page
      navigate('/login');

      // Optionally, you can close the modal if needed
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const signUserOut = () => {
    // Clear the token from session storage
    sessionStorage.removeItem('authToken');

    // Navigate to login page
    navigate('/login');

    // Optionally, you can close the modal if needed
    onClose();
  };

  useEffect(() => {
    if (show) {
      fetchUserProfile();
    }
  }, [show]);

  if (!show) return null; // Don't render if not showing

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Manage Profile</h2>
        <form onSubmit={storeSavedChanges}>
          <div className="form-group">
            <label htmlFor="name" className="profile-form-label">Name:</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="profile-form-label">Phone Number:</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              className="form-input" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="address" className="profile-form-label">Mailing Address:</label>
            <input 
              type="text" 
              id="address" 
              name="address" 
              className="form-input" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-changes-btn">Save Changes</button>
            <button type="button" className="sign-out-btn" onClick={signUserOut}>Sign Out</button>
            <button type="button" className="delete-account-btn" onClick={deleteAccount}>Delete Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageProfile;
