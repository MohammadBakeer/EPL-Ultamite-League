
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Leaderboard.css'; // Ensure the correct path to your CSS file
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'


const Rules = () => {
    const { userId } = useParams();
  return (
  
    <div>
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
      <h2>Game Rules</h2>
      <p>Welcome to our Fantasy Football Game! Below are the rules to make your gaming experience enjoyable:</p>

      <section>
        <h3>Scoring Rules</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at ex id risus sagittis blandit.</p>
        {/* Add more scoring rules here */}
      </section>

      <section>
        <h3>Team Management</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at ex id risus sagittis blandit.</p>
        {/* Add more team management rules here */}
      </section>

      <section>
        <h3>Game Schedule</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at ex id risus sagittis blandit.</p>
        {/* Add more game schedule rules here */}
      </section>

      {/* Add more sections for different rule categories */}
    </div>
  );
};

export default Rules;
