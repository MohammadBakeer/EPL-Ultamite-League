import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Edit from './Create-Team-Page/Edit-Team.jsx';
import Signup from './Authentication/Signup.jsx';
import Login from './Authentication/Login.jsx';
import Home from './User-Experience/Home.jsx'
import Leaderboard from './User-Experience/Leaderboard.jsx' 
import SquadView from './User-Experience/SquadView.jsx'
import Schedule from './User-Experience/Schedule.jsx'; 
import Predictor from './User-Experience/Predictor.jsx';
import Rules from './User-Experience/Rules.jsx';
import { UserProvider } from './UserContext.jsx';
import './styles/App.css';

const App = () => {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/edit/:userId" element={<Edit />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home/:userId" element={<Home />} />
        <Route path="/leaderboard/:userId" element={<Leaderboard />} />
        <Route path="/schedule/:userId" element={<Schedule />} /> 
          <Route path="/predictor/:userId" element={<Predictor />} /> 
          <Route path="/rules/:userId" element={<Rules />} />
        <Route path="/squad-view/:userId" element={<SquadView />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
