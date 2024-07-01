import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext.jsx';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import Field from '../components/Field.jsx';
import '../styles/SquadView.css'

const SquadView = () => {
  const { viewId } = useUser(); // Use the UserContext
  const [teamName, setTeamName] = useState('');

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;
const ID = viewId;
useEffect(() => {
  const fetchTeamName = async () => {
    try {
      // Get the token from session storage
      const token = sessionStorage.getItem('authToken');

      // Use a POST request to send viewId securely with Authorization header
      const response = await axios.post(
        'http://localhost:3000/api/getTeamName',
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
            <Field userId={ID} isHomePage={false} />
            <Link to={`/leaderboard`} className="Edit-team-link">
            <button className="Edit-team">Exit View</button>
            </Link>
        </div>
      </div>
        
    </div>
  );
};

export default SquadView;