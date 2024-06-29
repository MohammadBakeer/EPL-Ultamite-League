import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateTeam from './pages/createTeam.jsx'
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx'
import Leaderboard from './pages/Leaderboard.jsx' 
import SquadView from './pages/SquadView.jsx'
import Schedule from './pages/Schedule.jsx'; 
import Predictor from './pages/Predictor.jsx';
import Rules from './pages/Rules.jsx';
import { UserProvider } from './UserContext.jsx';
import './styles/App.css';

const App = () => {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/createteam/:userId" element={<CreateTeam />} />
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
