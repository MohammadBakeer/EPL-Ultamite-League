import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import PrivateRounds from '../components/leagues/PredictionLeague/PrivateRounds.jsx';
import { decodeJWT } from '../jwtUtils.js';
import { setLeagueId } from '../redux/leagueSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/FantasyLeague.css';
import '../styles/PrivatePredictionLeague.css';
import '../styles/pagination.css';
import axios from 'axios';

const PrivatePredictionLeague = () => {
  const dispatch = useDispatch();
  const leagueId = useSelector((state) => state.leagueId.leagueId);
  const [predictionData, setPredictionData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPredictionOption, setSelectedPredictionOption] = useState("allow_any");
  const [isOwner, setIsOwner] = useState(false);
  const [notAllowStarClick, setNotAllowStarClick] = useState(false) //Changes on submit click for option type and when atleast 1 star is selected or max 4 stars are selected
  const [chosenGames, setChosenGames] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [anyPrivateGames, setAnyPrivateGames] = useState(false) 
  const [starClicked, setStarClicked] = useState(false)
  const [leagueCode, setLeagueCode] = useState("");
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)

  const navigate = useNavigate();

  const itemsPerPage = 5;

  console.log(blockChanges);

  const fetchRoundStatus = async () => {
  
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/getRoundStatus', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
  
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num
  
      // Find the maximum round_num
      const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
      const currentRound = maxRoundNum + 1
      // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found
      setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);

      const currentRoundObject = data.find(round => round.round_num === currentRound);

      if (currentRoundObject) {
        const { is_current, start_date, finished } = currentRoundObject;
        const startDate = new Date(start_date);
        
        if (is_current || (startDate <= currentDate && !finished)) {
          setBlockChanges(true)

        } else {
          setBlockChanges(false)
        }
      }
      return currentRound
  };

  const fetchSubmitStatus = async (roundNum) => {
   
    if (!leagueId || !roundNum) {
        console.warn('League ID or Round Number is not available.');
        return;
    }

    const token = sessionStorage.getItem('authToken');

    try {
        const response = await axios.get(
            `http://localhost:3000/api/fetchSubmitStatus/${roundNum}/${leagueId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setIsSubmitted(response.data.isSubmitted);
    } catch (error) {
        console.error('Error fetching submit status:', error);
    }
};

const fetchPredictionOptionType = async (roundNum) => {
  if (!leagueId) {
    console.warn('League ID is not available.');
    return;
  }

  const token = sessionStorage.getItem('authToken');

  try {
    const response = await axios.get(`http://localhost:3000/api/fetchOptionType/${leagueId}/${roundNum}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    setSelectedPredictionOption(response.data.prediction_type);

  } catch (error) {
    console.error('Error fetching prediction option type:', error);
  }
};



  useEffect(() => {
    const decodedToken = decodeJWT();
    if (decodedToken && decodedToken.leagueId) {
      dispatch(setLeagueId(decodedToken.leagueId));
    }
    setLoading(false);
  }, [dispatch]);

  const fetchLeagueCode = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
  
    const token = sessionStorage.getItem('authToken');
  
    try {
      const response = await axios.get(`http://localhost:3000/api/fetchLeagueCode/${leagueId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const { leagueCode, message } = response.data;
  
      if (message === 'User is not the owner') {
        console.warn(message);
        // Handle the case where the user is not the owner (e.g., show a warning message)
      } else if (leagueCode) {
        setLeagueCode(leagueCode);
      } else {
        console.warn('League code not found.');
      }
    } catch (error) {
      console.error('Error fetching league code:', error);
    }
  };
  

  const handleFetchPredictionData = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.post('http://localhost:3000/api/privateleaguepoints', { leagueId }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = response.data.sort((a, b) => b.points - a.points);
      setPredictionData(sortedData);
    } catch (error) {
      console.error('Error fetching prediction data:', error);
    }
  };

  const checkIfOwner = async () => {
    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.get(`http://localhost:3000/api/checkIfOwner/${leagueId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setIsOwner(response.data.isOwner);
    } catch (error) {
      console.error('Error checking if owner:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      handleFetchPredictionData();
      checkIfOwner();
    }
  }, [leagueId, loading]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = predictionData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(predictionData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const Pagination = () => (
    <div className="pagination">
      <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <span className="pagination-of">{`${currentPage} of ${totalPages}`}</span>
      <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );

  const handleOptionChange = async (event) => {
    const newPredictionOption = event.target.value;
    setSelectedPredictionOption(newPredictionOption);

    if (!leagueId) {
      console.warn('League ID is not available.');
      return;
    }

    const token = sessionStorage.getItem('authToken');
    try {
      await axios.post('http://localhost:3000/api/storePrivatePredictionOption', {
        leagueId,
        roundNum,
        predictionType: newPredictionOption
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Prediction option stored successfully');
    } catch (error) {
      console.error('Error storing prediction option:', error);
    }
  };

  
  useEffect(() => {
    const fetchData = async () => {
        if (!leagueId) {
            console.warn('League ID is not available.');
            return;
        }

        try {
            // Fetch prediction data
            await handleFetchPredictionData();

            // Check if owner
            await checkIfOwner();

            await fetchLeagueCode();

            const currentRoundNum = await fetchRoundStatus(); 

            fetchSubmitStatus(currentRoundNum)

            fetchPredictionOptionType(currentRoundNum)

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    if (!loading) {
        fetchData();
    }
}, [leagueId, loading]);





  const saveSubmitStatus = async (leagueId, isSubmitted) => {
    const token = sessionStorage.getItem('authToken');
  
    try {
      const response = await axios.post(
        `http://localhost:3000/api/saveSubmitStatus`,
        {
          leagueId,
          roundNum,
          isSubmitted,
          selectedPredictionOption,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Submission status saved:', response.data);
    } catch (error) {
      console.error('Error saving submission status:', error);
    }
  };
  
  const handleOptionTypeSubmit = () => {
    
    if (chosenGames.length >= 1 && chosenGames.length < 5) {
      setNotAllowStarClick(true);
      setIsSubmitted(true);
      // Call saveSubmitStatus function
      saveSubmitStatus(leagueId, true);
    }
  };

useEffect(()=>{
  if(anyPrivateGames === true && isSubmitted === false && selectedPredictionOption === "allow_any"){
    setIsSubmitted(true)
    saveSubmitStatus(leagueId, isSubmitted)
  }
})
  
  useEffect(()=>{
    if(isSubmitted === true ){
      setNotAllowStarClick(true);
    }
  }, [isSubmitted])

  if(isSubmitted === false && starClicked === true){
    setStarClicked
  }

  const handleDeleteLeague = async () => {

    const token = sessionStorage.getItem('authToken'); // Adjust based on how you store the token

    try {
      const response = await axios.delete(`http://localhost:3000/api/deletePrivatePredictionLeague/${leagueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert('League deleted successfully.');
        navigate('/predictionleague')
 
      } else {
        alert('Failed to delete the league.');
      }
    } catch (error) {
      console.error('Error deleting the league:', error);
      alert('An error occurred while deleting the league.');
    }
  };
  
  return (
    <div>
      <Navbar />
      <h2>Private Prediction League</h2>
      <div className="prediction-table-wrapper">
        <Pagination />
        <table className="prediction-table">
          <thead>
            <tr>
              <th className="username-column">Username</th>
              <th className="points-column">Points</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td className="username-column">{item.teamName}</td>
                <td className="points-column">{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isOwner && (
        <div className="prediction-options-container">
          <div className="prediction-options">
            <h3 className="prediction-options-header">Choose a prediction option for Round {roundNum}:</h3>
            <div className="prediction-option">
              <label>
                <input
                  type="radio"
                  value="allow_any"
                  checked={selectedPredictionOption === "allow_any"}
                  onChange={handleOptionChange}
                  className="prediction-option-input"
                  disabled={isSubmitted || starClicked} 
                />
                Allow members to predict any 4 games
              </label>
            </div>
            <div className="prediction-option">
              <label>
                <input
                  type="radio"
                  value="choose_games"
                  checked={selectedPredictionOption === "choose_games"}
                  onChange={handleOptionChange}
                  className="prediction-option-input"
                  disabled={isSubmitted || starClicked || blockChanges} 
                />
                Choose the 4 games for members to make predictions on
              </label>
            </div>
            {selectedPredictionOption !== "allow_any" && (
              <button 
                className="option-type-submit" 
                onClick={handleOptionTypeSubmit} 
                disabled={isSubmitted} // Disable when isSubmitted is true
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
      <PrivateRounds
        defaultExpanded={true}
        roundbarText="Make 4 predictions per round"
        predictionOption={selectedPredictionOption}
        isOwner={isOwner}
        notAllowStarClick={notAllowStarClick} 
        setChosenGames={setChosenGames} // Pass setter function
        setAnyPrivateGames={setAnyPrivateGames}
        setStarClicked={setStarClicked}
        isSubmitted={isSubmitted}
        roundNum={roundNum}
      />
        {isOwner && (
      <div className="bottom-bar-container">
      <div className="bottom-bar">
        <span className="league-code">League Code: {leagueCode}</span>
           <button className="delete-league-button" onClick={handleDeleteLeague}>
            <FontAwesomeIcon icon={faTrash} /> Delete League
           </button>
      </div>
    </div>
     )}
    </div>
  ); 
};

export default PrivatePredictionLeague;
