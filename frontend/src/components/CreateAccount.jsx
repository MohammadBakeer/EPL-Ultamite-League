import React, { useState } from 'react';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/createAccount.css';



const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  const checkVerificationStatus = async (verificationToken, intervalId, timeoutId) => {
    const response = await fetch('http://localhost:3000/auth/checkIfVerified', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${verificationToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.verified) {
      // User is verified, navigate to the next page
      sessionStorage.removeItem('verificationToken');
      sessionStorage.setItem('authToken', data.token);
    
      navigate('/createteam');
      clearInterval(intervalId); // Stop checking
      clearTimeout(timeoutId); // Stop the timeout
    }
    else{
      sessionStorage.removeItem('verificationToken');
    }
  };

 const handleCreateAccount = async () => {
  
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        teamName: userName,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem('verificationToken', data.verificationToken);
      // Set up the interval to check every 10 seconds
      toast.success(data.message, { autoClose: 20000 });
      toast.success('Expires in 5 minutes', { autoClose: 20000 });
      
      const intervalId = setInterval(() => checkVerificationStatus(data.verificationToken, intervalId, timeoutId), 5000);

     
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId); // Stop checking
        toast.error('Verification window is closed. Please try again.', {
          duration: 30000, // Duration in milliseconds (30 seconds)
        });
        
      }, 360000); 
    } else {
      // User-friendly error messages
      if (data.error === 'Email already exists. Please choose another email.') {
        toast.error('User with this email already exists, Log in.');
      } else if (data.error === 'Team Name Already Exists') {
        toast.error('Team Name Already Exists.');
      } else if(data.error === 'You can only make 2 attempts per 24 hours. Please try again later.'){
        toast.error('You can only make 2 attempts per 24 hours. Please try again later.')
      }
      else if(data.error === 'Invalid email format'){
        toast.error('Invalid email format')
      }
       else  {
        // Developer error logging
        console.error('Failed to sign up:', data.message || data.error || response.statusText);
     
      }
    }
  } catch (error) {
    console.error('Error during signup:', error.message);
  }
};

  

    
const validate = () => {
  const errors = {};

  // Trim the values to check for empty spaces
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();
  const trimmedUserName = userName.trim();

  // Check if fields are empty and return if so
  if (!trimmedEmail) {
    errors.email = 'Email is required';
  }
  if (!trimmedUserName) {
    errors.userName = 'Team Name is required';
  }
  if (!trimmedPassword) {
    errors.password = 'Password is required';
  }
  if (!trimmedConfirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  }

  // Validate specific field rules if fields are not empty
  if (trimmedEmail && !trimmedEmail.includes('@')) {
    errors.email = 'Not a valid email';
    toast.error(errors.email);
  }
  if (trimmedPassword && trimmedPassword.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    toast.error(errors.password);
  }
  if (trimmedPassword && trimmedPassword !== trimmedConfirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    toast.error(errors.confirmPassword);
  }

  // New password validations
  const letterCount = (trimmedPassword.match(/[a-zA-Z]/g) || []).length;
  const hasUpperCase = /[A-Z]/.test(trimmedPassword);

  if (letterCount < 2) {
    errors.password = 'Password must contain at least 2 letters';
    toast.error(errors.password);
  }
  if (!hasUpperCase) {
    errors.password = 'Password must contain at least 1 uppercase letter';
    toast.error(errors.password);
  }

  // Validate username with the updated regex
  const userNameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)?$/;
  if (trimmedUserName.length < 6 || trimmedUserName.length > 17) {
    errors.userName = 'Team Name must be between 6 and 17 characters';
    toast.error(errors.userName);
  } else if (!userNameRegex.test(trimmedUserName)) {
    errors.userName = 'Team Name must contain only letters and at most one space';
    toast.error(errors.userName);
  }

  return errors;
};

  
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
         handleCreateAccount();
    } else {
      setErrors(validationErrors);
    }
  };

  const handleLogin = () => {
    navigate('/');
  };
  

  return (
    <div className="container">
      <div className="create-account-card"></div>
      <div className="create-account-form">
        <label htmlFor="email" className="create-label-email">
          <b>Email</b> <FontAwesomeIcon icon={faEnvelope} />
        </label>
        <input
          type="text"
          id="email"
          placeholder="Enter Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />


        <label htmlFor="userName" className="create-label-username">
          <b>Team Name</b>
        </label>
        <input
          type="text"
          id="userName"
          placeholder="Enter Username"
          name="user-name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
 

        <label htmlFor="password" className="create-label-password">
          <b>Password</b> <FontAwesomeIcon icon={faLock} />
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter Password"
          name="psw"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

           <label htmlFor="psw-confirm" className="create-label-confirmpaswword"><b>Confirm Password</b>   <FontAwesomeIcon icon={faLock} /> </label>
           <input
          type="password"
          id="con-pasw"
          placeholder="Confirm Password"
          name="psw-repeat"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

          <button type="button" className="create-account-btn" onClick={handleSubmit}>
            Create Account
          </button>
        
        <span className="create"><a href="" onClick={handleLogin}>Already have an account? Login Here</a></span>      
        </div>
        
      </div>
          
      
   
 );
}

export default CreateAccount