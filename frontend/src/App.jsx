
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EditTeam from './pages/editTeam.jsx';
import CreateTeam from './pages/createTeam.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import FantasyLeague from './pages/FantasyLeague.jsx';
import PrivateFantasyLeague from './pages/PrivateFantasyLeague.jsx';
import PredictionLeague from './pages/PredictionLeague.jsx';
import PrivatePredictionLeague from './pages/PrivatePredictionLeague.jsx';
import SquadView from './pages/SquadView.jsx';
import Rules from './pages/Rules.jsx';
import Schedule from './pages/Schedule.jsx';
import Prizes from './pages/Prizes.jsx';
import './styles/App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

const App = () => {
  return (

    <Router>
     <ToastContainer
        position="top-center" // Change position to top-center
        autoClose={2000}
      />
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editteam" element={<EditTeam />} />
        <Route path="/createteam" element={<CreateTeam />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/fantasyleague" element={<FantasyLeague />} />
        <Route path="/privatefantasyleague" element={<PrivateFantasyLeague />} />
        <Route path="/predictionleague" element={<PredictionLeague />} />
        <Route path="/privatepredictionleague" element={<PrivatePredictionLeague />} />
        <Route path="/schedule" element={<Schedule />} /> 
        <Route path="/rules" element={<Rules />} />
        <Route path="/squad-view" element={<SquadView />} />
        <Route path="/prizes" element={<Prizes />} />
      </Routes>
    </Router>
  
  );
}

export default App; 