import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateTeam from './pages/createTeam.jsx'
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx'
import FantasyLeague from './pages/FantasyLeague.jsx'
import PredictionLeague from './pages/PredictionLeague.jsx' 
import SquadView from './pages/SquadView.jsx'
import Predictions from './pages/Predictions.jsx';
import Rules from './pages/Rules.jsx';
import Schedule from './pages/Schedule.jsx'
import './styles/App.css';

const App = () => {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/createteam" element={<CreateTeam />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/fantasyleague" element={<FantasyLeague />} />
        <Route path="/predictionleague" element={<PredictionLeague />} />
        <Route path="/schedule" element={<Schedule />} /> 
        <Route path="/predictions" element={<Predictions />} /> 
        <Route path="/rules" element={<Rules />} />
        <Route path="/squad-view" element={<SquadView />} />
      </Routes>
    </Router>
  
  );
}

export default App; 