

import db from '../config/db.js'; // Adjust the path to your database config

// Define and export the function to get team name by user ID
export const getTeamNameByUserId = async (req, res) => {
  try {
    const { viewId } = req.body; 
    let { userId } = req.body
    
    if(viewId) {
      userId = viewId
    }
  
    // Perform the database query to get the team name based on the user ID
    const result = await db.query('SELECT team_name FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length > 0) {
      const teamName = result.rows[0].team_name;
      res.json({ teamName });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching team name:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const sendContactEmail = async (req, res) => {

  try {

    const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  const { name, email, message, subject } = req.body;
  
  const recipientEmail = process.env.EMAIL_USER;
  
  // Prepare the email parameters
  const templateParams = {
    from_name: name,
    from_email: email,
    message: message,
    recipientEmail,
    subject: subject || 'Contact Form Submission',
  };
  
  // Return email details and EmailJS credentials to the frontend
  res.status(200).json({
    message: 'Email details retrieved successfully',
    emailDetails: templateParams,
    emailConfig: {
      serviceID: process.env.EMAILJS_SERVICE_ID,
      templateID: process.env.EMAILJS_TEMPLATE_ID,
      userID: process.env.EMAILJS_USER_ID,
    },
  });
} catch (error) {
  console.error('Error retrieving email details:', error.message);
  res.status(500).json({ error: 'Internal Server Error' });
  }
  };