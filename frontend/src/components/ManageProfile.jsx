import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify';
import '../styles/ManageProfile.css';

const ManageProfile = ({ show, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationName, setConfirmationName] = useState(''); // New state for confirmation input
  const [error, setError] = useState(''); // New state for error messages
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/fetchuserprofile', {
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
      const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/updateuserprofile', {
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

      // Optionally, you can show a success message or perform additional actions
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const confirmDeleteAccount = () => {
    setShowConfirmation(true); // Show confirmation prompt
  };

  const handleConfirmDelete = async () => {
    if (confirmationName !== name) {
      setError('Team Name does not match. Please try again.'); // Set error message
      return; // Prevent further execution
    }

    setError(''); // Clear any previous error messages
    setShowConfirmation(false); // Hide confirmation prompt

    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/deleteuserprofile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      const result = await response.json();

      // Clear the token from session storage
      sessionStorage.removeItem('authToken');
      
      toast.success('Successfully deleted account')
      // Navigate to login page
      navigate('/login');

      // Optionally, you can close the modal if needed
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false); // Hide confirmation prompt
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
        {!showConfirmation && (
          <button className="close-button" onClick={onClose}>X</button>
        )}
        <h2>Manage Profile</h2>
        {showConfirmation ? (
          <div className="confirmation-prompt">
            <p>Type and confirm your Team Name to delete your account:</p>
            <input 
              type="text" 
              value={confirmationName} 
              onChange={(e) => setConfirmationName(e.target.value)} 
              placeholder="Enter team name" 
            />
            {error && <p className="error-message">{error}</p>} {/* Display error message */}
            <div className="confirmation-actions">
              <button onClick={handleConfirmDelete} className="confirm-btn">Confirm</button>
              <button onClick={handleCancelDelete} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <form onSubmit={storeSavedChanges}>
            <div className="form-group">
              <label htmlFor="name" className="profile-form-label">Team Name:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-input" 
                value={name} 
                readOnly
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
              <button type="button" className="sign-out-btn" onClick={signUserOut}>Sign Out</button>
              <button type="submit" className="save-changes-btn">Save Changes</button>
              <button type="button" className="delete-account-btn" onClick={confirmDeleteAccount}>Delete Account</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageProfile;
