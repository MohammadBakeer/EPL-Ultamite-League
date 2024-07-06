import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import '../styles/LogIn.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { setUserId } = useUser();

  const handleLogIn = async () => {
    try {
      // Send a POST request to your backend with login data
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Check if the request was successful (status code 2xx)
      if (response.ok) {
        const data = await response.json();
        if (data.match) {

          console.log('There is a match!');

          sessionStorage.setItem('authToken', data.token);

          const decodedToken = decodeJWT(data.token);

          const userId = decodedToken.userId; 
     
          // Set the user_id in the UserContext
          setUserId(userId);
           
          navigate('/home'); // Navigate to the Edit component
        } else {
          console.log('No match found.');
        }
      } else {
        console.error('Failed to log in:', response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };

  const decodeJWT = (token) => {
    const base64Url = token.split('.')[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64 URL decode
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload); // Parse the JSON payload
  };
  
  
  
  return (
  <div className="login-page">
    <div className="login-container">
    <div className="signup-link">
          <Link to="/signup">Don't have an account? Sign up now {'>'} </Link>
        </div>
      <div className="top-login">
        <h2>Log In</h2>
      </div>
      {/* Social media icons */}
      <div className="social-icons">
          <FontAwesomeIcon icon={faInstagram} className="social-icon" />
          <FontAwesomeIcon icon={faTiktok} className="social-icon" />
          <FontAwesomeIcon icon={faYoutube} className="social-icon" />
          <FontAwesomeIcon icon={faFacebook} className="social-icon" />
        </div>
      <form>
      <div className="in-form">
      <div className="log-inputs-inform">
        <div className="input-email">
        <div className="label-container">
        <label htmlFor="email">
          <FontAwesomeIcon icon={faEnvelope} /> Email
       </label>
       </div>
      <input 
        type="email"
        id="email"
        value={email}
        placeholder='Type your email'
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      </div>
      <div className="input-pass">
      <div className="label-container">
        <label htmlFor="password">
          <FontAwesomeIcon icon={faLock} /> Password
        </label>
      </div>
      <input
        type="password"
        id="password"
        value={password}
        placeholder='Type your password'
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      </div>
        </div>

        <button className="logbtn" type="button" onClick={handleLogIn}>
          Log In
        </button>
        </div>
      </form>
    </div>
    

      <div className="log-display-container">
        <div className="log-txt-container">
          <div className="login-h1-EPL-container">
            <h1 className='login-h1-EPL'>EPL Ultamite League</h1>
          </div>
          <div className="login-h3-EPL-container">
            <h3 className='login-h3-EPL'>Earn Ultamite Points from Live Performances!</h3>
          </div>
        </div>
        <div className="log-img">
          <img src="/epl-preremove-removebg-preview-transformed.png" alt="epl-players" />
        </div>
      </div>

  </div>  
  );
};

export default Login;