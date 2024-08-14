import React, { useState } from "react";
import axios from 'axios';
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import '../styles/ContactUs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com'; // Make sure to import EmailJS

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const { name, email, message } = formData;

    const nameRegex = /^[A-Za-z]{1,8}(\s[A-Za-z]{1,8})?$/;
    if (!nameRegex.test(name)) {
      alert('Name must contain only letters, one space, and be max 17 characters.');
      return false;
    }

    if (!email.includes('@')) {
      alert('Please enter a valid email address.');
      return false;
    }

    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 70) {
      alert('Message must be 70 words or less.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await sendContactEmail();
    }
  };

 
  const sendContactEmail = async () => {
    const token = sessionStorage.getItem('authToken');

    const { name, email, message } = formData;
  
    try {
      const response = await axios.post(
        'http://localhost:3000/api/sendContactEmail',
        { name, email, message },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
            'Content-Type': 'application/json', // Optional, specify the content type
          },
        }
      );
  
      const { emailDetails, emailConfig, recipientEmail } = response.data;
  
      // Use EmailJS to send the email directly from the frontend
      await emailjs.send(
        emailConfig.serviceID,
        emailConfig.templateID,
        {
          from_name: emailDetails.from_name,
          from_email: emailDetails.from_email,
          message: emailDetails.message,
          subject: emailDetails.subject,
          to_email: recipientEmail, 
        },
        emailConfig.userID
      );
  
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' }); // Reset form
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send message.');
    }
  };
  
  

  return (
    <>
      <Navbar />
      <div className="contact-us-page">
        <div className="contact-us-container">
          <h1 className="contact-us-title">Contact Us</h1>
          <form onSubmit={handleSubmit} className="contact-us-form">
            <div className="contact-us-form-group">
              <label htmlFor="name" className="contact-us-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="contact-us-input"
              />
            </div>
            <div className="contact-us-form-group">
              <label htmlFor="email" className="contact-us-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="contact-us-email-input contact-us-input"
              />
            </div>
            <div className="contact-us-form-group">
              <label htmlFor="message" className="contact-us-label">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="contact-us-textarea"
              />
            </div>
            <button type="submit" className="contact-us-submit-button">Send Message</button>
          </form>
        </div>
      </div>
      <ToastContainer />
      <Footer />
    </>
  );
};

export default ContactUs;
