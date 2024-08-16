import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 
import { decodeJWT } from '../jwtUtils.js';
import { setViewId } from '../redux/viewSlice';
import Field from '../components/field/Field.jsx';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/SquadView.css'

const SquadView = () => {
  const viewId = useSelector((state) => state.viewId.value); 
  const dispatch = useDispatch();
  const [teamName, setTeamName] = useState('');
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)

  const navigate = useNavigate();

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  useEffect(() => {
    const decodedToken = decodeJWT();
    if (decodedToken && decodedToken.viewId) {
      dispatch(setViewId(decodedToken.viewId));
    }
  
  }, [dispatch]);


  const fetchRoundStatus = async () => {
  
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/getRoundStatus', {
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
  
 
useEffect(() => {
  fetchRoundStatus();
}, []);

useEffect(() => {
  const fetchTeamName = async () => {
    try {
      // Get the token from session storage
      const token = sessionStorage.getItem('authToken');

      // Use a POST request to send viewId securely with Authorization header
      const response = await axios.post(
        'https://epl-ultimate-league-server.up.railway.app/api/getTeamName',
        { viewId }, // Request body
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

  if (viewId) {
    fetchTeamName();
  }
}, [viewId]);

  return (
    <div className="squad-page">
      <div className="home-field-container">
        <div className="home-field">
            <h1 className="home-team">{teamName}</h1>
            <Field viewId={viewId} isHomePage={false} roundNum = {roundNum} blockChanges = {blockChanges} />
            <button className="squad-view-button" onClick={() => navigate(-1)}>Exit View</button>
        </div>
      </div>
        
    </div>
  );
};

export default SquadView;