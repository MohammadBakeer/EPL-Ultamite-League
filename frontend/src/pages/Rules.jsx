// Rules.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import '../styles/Rules.css'

const Rules = () => {
  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  return (
    <div>
      <div className="home-nav-bar">
        <Link to={`/home`} className="leader-nav-item" title="Home">
          <i className="fas fa-home"></i>
        </Link>
        <Link to={`/leaderboard`} className="leader-nav-item" title="Leaderboard">
          <i className="fas fa-trophy"></i>
        </Link>
        <Link to={`/predictor`} className="leader-nav-item" title="Predictor">
          <i className="fas fa-futbol"></i>
        </Link>
        <Link to={`/rules`} className="leader-nav-item" title="Rules">
          <i className="fas fa-scroll"></i>
        </Link>
        <Link to={`/schedule`} className="leader-nav-item" title="Schedule">
          <i className="fas fa-calendar-alt"></i>
        </Link>
      </div>
      <div className='Rules'>
      <h2>Game Rules</h2>

      <section>
        <h3>Team Management</h3>
        <p>
          You are given a budget of $1000 to create your fantasy team. Each time you make changes to your team, you lose 500 points.
        </p>
        <p>
          You are allowed to make up to 3 changes per 4 match days. Be strategic in managing your team to maximize your points!
        </p>
        {/* Add more team management rules here */}
      </section>

     
      <section>
        <h4>Player Performance Points</h4>
        <p>
          Your fantasy team earns points based on your players' performance in the matches. The points are calculated as follows:
        </p>
        <ul>
          <li>
            Forwards (FWD):
            <ul>
              <li>Goals Scored: 14 points each</li>
              <li>Assists: 10 points each</li>
              <li>Clean Sheets: 4 points each</li>
              <li>Goals Conceded: -1 point each</li>
              <li>Yellow Cards: -5 points each</li>
              <li>Red Cards: -15 points each</li>
              <li>Minutes Played: 10 points for every 90 minutes</li>
              {/* Add any additional details for forwards here */}
            </ul>
          </li>
          <li>
            Midfielders (MID):
            <ul>
              <li>Goals Scored: 18 points each</li>
              <li>Assists: 10 points each</li>
              <li>Clean Sheets: 6 points each</li>
              <li>Goals Conceded: -3 points each</li>
              <li>Yellow Cards: -2 points each</li>
              <li>Red Cards: -8 points each</li>
              <li>Minutes Played: 10 points for every 90 minutes</li>
              {/* Add any additional details for midfielders here */}
            </ul>
          </li>
          <li>
            Defenders (DEF):
            <ul>
              <li>Goals Scored: 20 points each</li>
              <li>Assists: 15 points each</li>
              <li>Clean Sheets: 18 points each</li>
              <li>Goals Conceded: -5 points each</li>
              <li>Yellow Cards: -2 points each</li>
              <li>Red Cards: -8 points each</li>
              <li>Minutes Played: 15 points for every 90 minutes</li>
              {/* Add any additional details for defenders here */}
            </ul>
          </li>
          <li>
            Goalkeepers (GK):
            <ul>
              <li>Clean Sheets: 25 points each</li>
              <li>Goals Conceded: -10 points each</li>
              <li>Penalties Saved: 50 points each</li>
              <li>Saves: 4 points each</li>
              <li>Minutes Played: 10 points for every 90 minutes</li>
              {/* Add any additional details for goalkeepers here */}
            </ul>
          </li>
        </ul>
        {/* Add any additional details or explanations here */}
      </section>
      </div>
    </div>
  );
};

export default Rules;
