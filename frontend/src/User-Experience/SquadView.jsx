import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Field from '../../src/Create-Team-Page/Field.jsx';
import '../styles/SquadView.css'

const SquadView = () => {
  const { viewId } = useUser(); // Use the UserContext
  const [teamName, setTeamName] = useState('');

  const { userId } = useParams();

const ID = viewId;
  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getTeamName/${viewId}`);
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
            <Link to={`/leaderboard/${userId}`} className="Edit-team-link">
            <button className="Edit-team">Exit View</button>
            </Link>
        </div>
      </div>
        
    </div>
  );
};

export default SquadView;
