import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import Field from '../components/field/Field.jsx';  // Update the path accordingly
import Navbar from '../components/Navbar.jsx'
import '../styles/Home.css';

const Home = () => {

  const [teamName, setTeamName] = useState('');

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

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
  <div className="home-page">
    < Navbar/>
    <div className="home-field-container">
        <div className="home-field">
            <h1 className="home-team">{teamName}</h1>
            <Field userId={userId} isHomePage={false}/> {/* Pass userId only */}
            <Link to={`/createteam`} className="Edit-team-link">
                <button className="Edit-team">View Squad</button>
            </Link>
        </div>
    </div>
    </div>
  );
};

export default Home;


