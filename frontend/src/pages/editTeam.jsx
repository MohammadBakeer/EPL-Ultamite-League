import React, { useState, useEffect } from 'react';
import Table from '../components/table/Table.jsx'
import Field from '../components/field/Field.jsx';
import { useNavigate } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import Footer from '../components/Footer.jsx'
import axios from 'axios'; 
import '../styles/Edit-Team.css'

const Edit = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamName, setTeamName] = useState(''); // State to store team name
  const [isClearTeamRequested, setIsClearTeamRequested] = useState(false);
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)
  const [deleteCount, setDeleteCount] = useState(0)
  const [changeCount, setChangeCount] = useState(0)
  
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

      return currentRound
  };

  const storeChangeStatus = async () => {
    const token = sessionStorage.getItem('authToken');
    try {
      await axios.post(
        'http://localhost:3000/api/storeChangeStatus',
        {
          deleteCount,
          changeCount,
          roundNum
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error storing change status:', error.message);
    }
  };

  const fetchChangeStatus = async (currentRoundNum) => {
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.get(`http://localhost:3000/api/fetchChangeStatus/${currentRoundNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const { delete_count, change_count } = response.data;

      setDeleteCount(delete_count);
      setChangeCount(change_count);

    } catch (error) {
      console.error('Error fetching change status:', error.message);
    }
  };
  
 
  useEffect(() => {
    const initialize = async () => {
      const currentRoundNum = await fetchRoundStatus(); // Wait for this to finish
      fetchChangeStatus(currentRoundNum); // Now call fetchChangeStatus
    };

    initialize();
  }, []);

useEffect(() => {
  storeChangeStatus();
}, [deleteCount, changeCount]);


  const handleConfirmTeam = () => { 
    // Perform any logic needed before confirming the team

    // After confirming the team, navigate to the home page with the specific user ID
    navigate(`/home`);
  };



  // Callback function to reset isClearTeamRequested
  const onClearTeam = () => {
    setIsClearTeamRequested(false);
  };


  const handlePlayerSelection = (player) => {
    if(!blockChanges){
    setSelectedPlayer(player);
    }
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
    <div className='edit-team-container'>
      <nav className="edit-nav">
        <button className="confirm-button" onClick={handleConfirmTeam}>Confirm Team</button>
           <h2 className="edit-field-h2">{teamName}</h2>
            <h3 className='edit-field-h3'>{changeCount}/2 changes for round {roundNum}</h3>
      </nav>

      <div className="edit-container">
        <Field selectedPlayer={selectedPlayer} userId={userId} isClearTeamRequested={isClearTeamRequested} onClearTeam={onClearTeam} isHomePage = {true} roundNum = {roundNum} blockChanges = {blockChanges} deleteCount = {deleteCount}  changeCount = {changeCount} setDeleteCount = {setDeleteCount} setChangeCount = {setChangeCount}/>
        <Table onPlayerSelect={handlePlayerSelection}  blockChanges={blockChanges} roundNum={roundNum}/>
      </div>
      < Footer/>
    </div>
    
  );
};

export default Edit;