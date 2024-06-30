import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext.jsx';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Field from '../components/Field.jsx';  // Update the path accordingly
import '../styles/Home.css';

const Home = () => {

    const { userId } = useParams();

    const [teamName, setTeamName] = useState('');

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

    console.log('Home:', userId);
  return (
  <div className="home-page">
     <div className="home-nav-bar">
     <Link to={`/home/${userId}`} className="leader-nav-item" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to={`/leaderboard/${userId}`} className="leader-nav-item" title="Leaderboard">
          <i className="fas fa-trophy"></i>
        </Link>
        <Link to={`/predictor/${userId}`} className="leader-nav-item" title="Predictor">
          <i className="fas fa-futbol"></i>
        </Link>
        <Link to={`/rules/${userId}`} className="leader-nav-item" title="Rules">
          <i className="fas fa-scroll"></i>
        </Link>
        <Link to={`/schedule/${userId}`} className="leader-nav-item" title="Schedule">
          <i className="fas fa-calendar-alt"></i>
        </Link>
      </div>
    <div className="home-field-container">
        <div className="home-field">
            <h1 className="home-team">{teamName}</h1>
            <Field userId={userId} isHomePage={false}/> {/* Pass userId only */}
            <Link to={`/createteam/${userId}`} className="Edit-team-link">
                <button className="Edit-team">View Squad</button>
            </Link>
        </div>
    </div>
  </div>  
  );
};

export default Home;


