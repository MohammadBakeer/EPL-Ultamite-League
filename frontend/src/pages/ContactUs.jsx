import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import '../styles/ContactUs.css';
import emailjs from 'emailjs-com';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    // Name validation: only letters, one space, max 17 characters
    const nameRegex = /^[A-Za-z]{1,8}(\s[A-Za-z]{1,8})?$/;
    if (!nameRegex.test(name)) {
      alert('Name must contain only letters, one space, and be max 17 characters.');
      return false;
    }

    // Email validation: contains "@"
    if (!email.includes('@')) {
      alert('Please enter a valid email address.');
      return false;
    }

    // Message validation: max 70 words
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 70) {
      alert('Message must be 70 words or less.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      sendEmail();
    }
  };

  const sendEmail = () => {
    const { name, email, message } = formData;

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      subject: 'FPL User Contact'
    };

    console.log('Sending email with the following parameters:', templateParams); // Debug log

    emailjs.send('service_zmn733r', 'template_oo1oter', templateParams, '3o1FkrRqpKtc_Etnc')
      .then(response => {
        console.log('SUCCESS!', response.status, response.text);
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Reset form
      })
      .catch(err => {
        console.error('Failed to send email:', err);
        alert(`Failed to send message: ${err.text}`); // Log the error text
      });
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
                className="contact-us-email-input contact-us-input" // Apply the same class
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
