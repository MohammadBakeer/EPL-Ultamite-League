import React, { useState, useEffect } from 'react';
import LoginCard from '../components/LoginCard';
import Footer from '../components/Footer'
import ScheduleRounds from '../components/ScheduleRounds';

import '../styles/LogIn.css';

const Login = () => {

  const [roundNum, setRoundNum] = useState(null);
 

  const fetchRoundStatus =  async () => {
   
    const response = await fetch('http://localhost:3000/api/getScheduleRoundStatus', {
      method: 'GET',
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
  
    const finishedRounds = data
      .filter(round => round.finished)
      .map(round => round.round_num);
  
    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1;
    setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);
    
    return currentRound;
  };

  useEffect(() =>{
      fetchRoundStatus()
  }, [])
  console.log(roundNum);

  return (
    <>
    <div className="login-page">
      <div className="login-container">
        <LoginCard roundNum={roundNum} />
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
    </div>
      <ScheduleRounds />
      <Footer />
    </>
  );
};

export default Login;



