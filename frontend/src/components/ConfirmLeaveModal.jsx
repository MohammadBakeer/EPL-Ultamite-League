import React, { useState } from 'react';
import '../styles/confirmModal.css'; // Import CSS for styling

const ConfirmLeaveModal = ({ leagueName, onConfirm, onCancel }) => {
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (inputName !== leagueName) {
      setError('League Name does not match.');
    } else {
      setError('');
      onConfirm();
    }
  };

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>Confirm Leaving the League</h2>
        <p>Type the League Name to confirm leaving the league:</p>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Enter league name"
        />
        {error && <p className="error-message">{error}</p>}
        <div className="confirm-modal-actions">
          <button onClick={handleConfirm} className="confirm-btn">Confirm</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLeaveModal;
