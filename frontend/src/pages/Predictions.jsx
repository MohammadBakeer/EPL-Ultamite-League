
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/FantasyLeague.css'; // Ensure the correct path to your CSS file
import { decodeJWT } from '../jwtUtils.js';

const Predictor = () => {

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
      <h2>Predictor</h2>
      <p>The predictor is currently being updated. Please check back soon!</p>
  
    </div>
  );
};

export default Predictor;