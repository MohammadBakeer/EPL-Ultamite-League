import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { decodeJWT } from '../jwtUtils.js';
import { setViewId } from '../redux/viewSlice';
import Field from '../components/field/Field.jsx';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/SquadView.css'

const SquadView = () => {
  const viewId = useSelector((state) => state.viewId.value); 
  const dispatch = useDispatch();
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  useEffect(() => {
    const decodedToken = decodeJWT();
    if (decodedToken && decodedToken.viewId) {
      dispatch(setViewId(decodedToken.viewId));
    }
  
  }, [dispatch]);

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
            <Field viewId={viewId} isHomePage={false} />
            <button className="Edit-team" onClick={() => navigate(-1)}>Exit View</button>
        </div>
      </div>
        
    </div>
  );
};

export default SquadView;