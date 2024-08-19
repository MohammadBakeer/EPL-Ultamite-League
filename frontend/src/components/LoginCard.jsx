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
          else if(teamData.message === 'User not found'){
            toast.error('User not found')
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
  
      // Check if the response status is 404 (Not Found)
      if (teamResponse.status === 404) {
        toast.error('No user found with this email');
        return; // Stop further execution if no user is found
      }
  
      // Handle other non-OK responses
      if (!teamResponse.ok) {
        toast.error(`Request failed: ${teamResponse.status}`);
        return;
      }
  
      // Parse the response if the email exists
      const teamData = await teamResponse.json();
      loginVerification(teamData);
  
    } catch (error) {
      toast.error('Error during login');
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
