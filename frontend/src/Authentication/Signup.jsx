import React, { useState, useEffect } from 'react';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';
import Field from '../Create-Team-Page/Field.jsx'; // Import the Field component
import { useUser } from '../UserContext.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();

  const { setUserId } = useUser();

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`http://localhost:3000/checkEmail/${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email existence:', error.message);
      return false;
    }
  };

  const handleSignUp = async () => {
    try {
      // Check if the email already exists in the database
      const emailExists = await checkEmailExists(email);
  
      if (emailExists) {
        console.log('Email already exists. Please choose another email.');
        return;
      }
  
      // If email does not exist, proceed with signup
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          teamName,
        }),
      });
  
      // Check if the request was successful (status code 2xx)
      if (response.ok) {
        // Parse the response JSON to get the user_id
        const data = await response.json();
        const user_id = data.user.user_id;
  
        // Set the user_id in the component state
        setUserId(user_id);
  
        console.log('User signed up successfully!');
  
        // Navigate to the Edit component with the user_id
        navigate(`/edit/${user_id}`);
        // Optionally, you can redirect the user or perform other actions after signup
      } else {
        console.error('Failed to sign up:', response.statusText);
      }
    } catch (error) {
      console.error('Error during signup:', error.message);
    }
  };
  


  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="sig-head-social">
        <div className="top-signin">
          <h2>Sign Up</h2>
          <h4>Build Your Winning XI</h4>
        </div>
        <div className="social-icons">
          <FontAwesomeIcon icon={faInstagram} className="social-icon" />
          <FontAwesomeIcon icon={faTiktok} className="social-icon" />
          <FontAwesomeIcon icon={faYoutube} className="social-icon" />
          <FontAwesomeIcon icon={faFacebook} className="social-icon" />
        </div>
        </div>
        <form>
          <div className="in-form">
            <div className="sign-inputs-inform">
              <div className="label-container">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} /> Email
                </label>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                placeholder="Type your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="label-container">
                <label htmlFor="password">
                  <FontAwesomeIcon icon={faLock} /> Password
                </label>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                placeholder="Type your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="label-container">
                <label htmlFor="teamName">
                  Team Name
                </label>
              </div>
              <input
                type="text"
                id="teamName"
                value={teamName}
                placeholder="Type your team name"
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <button className="sigbtn" type="button" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        </form>
      </div>
      <div className="sign-display-container">
        <div className="sign-txt-container">
          <div className="signin-h1-EPL-container">
            <h1 className="signin-h1-EPL">EPL Ultimate League</h1>
          </div>
          <div className="signin-h3-EPL-container">
            <h3 className="signin-h3-EPL">Earn Ultimate Points from Live Performances!</h3>
          </div>
        </div>
        <div className="sign-img">
          <img src="/epl-preremove-removebg-preview-transformed.png" alt="epl-players" />
        </div>
      </div>
    </div>
  );
};



export default SignUp;
