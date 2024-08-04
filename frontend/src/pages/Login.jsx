import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import LoginCard from '../components/LoginCard';
import ScheduleRounds from '../components/ScheduleRounds';

import '../styles/LogIn.css';

const Login = () => {



  return (
    <div className="login-page">
      <div className="login-container">
        <LoginCard />
        <div className="logincard">
          <div className="signin-h1-EPL-container">
            <h1 className="signin-h1-EPL">EPL Ultimate League</h1>
          </div>
          <div className="signin-h3-EPL-container">
            <h3 className="signin-h3-EPL">Earn points from Live Performances!</h3>
            <h4>Build Your Winning XI</h4>
          </div>
          <div className="sign-img">
            <img src="/epl-preremove-removebg-preview-transformed.png" alt="epl-players" />
          </div>
        </div>
      </div>
      <ScheduleRounds />
    </div>
  );
};

export default Login;



