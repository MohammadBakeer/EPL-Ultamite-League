import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import '../styles/LoginCard.css';

const LoginCard = ({roundNum}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const loginVerification = async (teamData) => {
    try{
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, teamData, roundNum }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.match) {
         
          sessionStorage.setItem('authToken', data.token);

          if(teamData.present === false){
            navigate('/createteam')
          }
          else{
          navigate('/home');
          }
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        toast.error('Failed to log in');
      }

    }catch (error) {
      toast.error('Error during login');
      console.error('Error during login:', error.message);
    }
  }



  const handleLogIn = async () => { 

    try {
      const teamResponse = await fetch(`http://localhost:3000/auth/teamPresent/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!teamResponse.ok) {
        const errorResponse = await teamResponse.text(); // Get response as text
        console.error('Error response:', errorResponse);
        toast.error('Request failed: ' + teamResponse.status);
        return; // Exit the function if the request fails
    }
    
    const teamData = await teamResponse.json();
  
    loginVerification(teamData)

    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="logincard-container">
      <div className="login-card"></div>

      <div className="login-form">
      <label htmlFor="email" className="create-label-email">
        <b>Email</b> <FontAwesomeIcon icon={faEnvelope} />
        </label>
        <input
          type="email"
          className="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        
        <label htmlFor="password" className="create-label-password">
          <b>Password</b> <FontAwesomeIcon icon={faLock} />
        </label>
        <input
          type="password"
          className="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="start-btn" onClick={handleLogIn}>Sign In</button>

        <div className="create-forgot">
          <span className="create"><a href="" onClick={handleCreateAccount}>Don't have an account? Click here to Create an Account</a></span>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
