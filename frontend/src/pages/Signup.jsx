import React, { useState, useEffect } from 'react';
import '../styles/SignUp.css';
import CreateAccountCard from '../components/CreateAccount.jsx'
import ScheduleRounds from '../components/ScheduleRounds.jsx';
import Footer from '../components/Footer.jsx'


const SignUp = () => {

    


  return (
    <div className="signup-page">
      <div className="signup-container">
        <CreateAccountCard />
        <div className="signupcard">
          <div className="signin-h1-EPL-container">
            <h1 className="signin-h1-EPL">EPL Ultimate League</h1>
          </div>
          <div className="signin-h3-EPL-container">
            <h3 className="signin-h3-EPL">Earn Points from Live Performances!</h3>
            <h4>Build Your Winning XI</h4>
          </div>
          <div className="sign-img">
            <img src="/epl-preremove-removebg-preview-transformed.png" alt="epl-players" />
          </div>
        </div>
      </div>
      <ScheduleRounds />
      <Footer />
    </div>
  );
};

export default SignUp;