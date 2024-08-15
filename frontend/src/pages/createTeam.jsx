import React, { useState, useEffect } from 'react';
import Table from '../components/table/Table.jsx'
import CreateField from '../components/field/createField.jsx';
import { useNavigate } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import Footer from '../components/Footer.jsx'
import axios from 'axios'; 
import '../styles/Create-Team.css'



const Edit = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamName, setTeamName] = useState(''); // State to store team name
  const [isClearTeamRequested, setIsClearTeamRequested] = useState(false);
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false) // this state is needed since it will be always false
  const [deleteCount, setDeleteCount] = useState(0) // always be 0
  const [changeCount, setChangeCount] = useState(0) // always be 0 
  const [teamFilled, setTeamFilled] = useState(false) //Confirm button can only be pressed if all the positions are filled out including subs

  const navigate = useNavigate();


  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const fetchRoundStatus = async () => {
  
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/getRoundStatus', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
  
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num
  
      // Find the maximum round_num
      const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
      const currentRound = maxRoundNum + 1
      // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found
      setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);

      const currentRoundObject = data.find(round => round.round_num === currentRound);

      if (currentRoundObject) {
        const { is_current, start_date, finished } = currentRoundObject;
        const startDate = new Date(start_date);
        
        if (is_current || (startDate <= currentDate && !finished)) {
          setBlockChanges(true)

        } else {
          setBlockChanges(false)
        }
      }
  };

  useEffect(() => {
    fetchRoundStatus();
  }, []);

  const handleConfirmTeam = () => { 
    // Perform any logic needed before confirming the team
    navigate(`/home`);
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
  }, [userId]); 

  return (
    <div className='create-team-page'>  
      <nav className="create-navbar">
        <button className="confirm-button" onClick={handleConfirmTeam}>Confirm Team</button>
        <h2>{teamName}</h2>
        <button className="clear-button" onClick={handleClearTeam}>Clear Team</button>
      </nav>

      <div className="create-field-container">
        <CreateField selectedPlayer={selectedPlayer} userId={userId} isClearTeamRequested={isClearTeamRequested} onClearTeam={onClearTeam} isHomePage = {true} roundNum = {roundNum} blockChanges = {blockChanges} />
        <Table onPlayerSelect={handlePlayerSelection} blockChanges={blockChanges} roundNum={roundNum} />
      </div>
      < Footer/>
    </div>
  );
};

export default Edit;