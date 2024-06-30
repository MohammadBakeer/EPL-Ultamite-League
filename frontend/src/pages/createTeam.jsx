import React, { useState, useEffect } from 'react';
import Table from '../components/Table.jsx';
import Field from '../components/Field.jsx';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import '../styles/Edit-Team.css'

const Edit = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamName, setTeamName] = useState(''); // State to store team name
  const [isClearTeamRequested, setIsClearTeamRequested] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();

  console.log(userId);

  const handleConfirmTeam = () => { 
    // Perform any logic needed before confirming the team

    // After confirming the team, navigate to the home page with the specific user ID
    navigate(`/home/${userId}`);
  };


  const handleClearTeam = () => {
    setIsClearTeamRequested(true);
  };

  // Callback function to reset isClearTeamRequested
  const onClearTeam = () => {
    setIsClearTeamRequested(false);
  };


  const handlePlayerSelection = (player) => {
    setSelectedPlayer(player);
  };

  useEffect(() => {
    // Fetch team name when component mounts
    const fetchTeamName = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axios.post(
          'http://localhost:3000/api/getTeamName',
          { userId }, // Request body
          {
            headers: {
              'Authorization': `Bearer ${token}`, // Include the token in Authorization header
              'Content-Type': 'application/json' // Optional, specify the content type
            }
          }
        );
        setTeamName(response.data.teamName);
      } catch (error) {
        console.error('Error fetching team name:', error.message);
      }
    };

    fetchTeamName();
  }, [userId]); // Fetch team name when userId changes

  

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <button className="confirm-button" onClick={handleConfirmTeam}>Confirm Team</button>
        <h2>{teamName}</h2>
        <button className="clear-button" onClick={handleClearTeam}>Clear Team</button>
      </nav>

      {/* Main content */}
      <div className="app-container">
        <Table onPlayerSelect={handlePlayerSelection} />
        <Field selectedPlayer={selectedPlayer} userId={userId} isClearTeamRequested={isClearTeamRequested} onClearTeam={onClearTeam} isHomePage = {true} />
      </div>
    </div>
  );
};

export default Edit;