import React, { useEffect,useState } from 'react';
import { useUser } from '../UserContext.jsx';
import '../styles/Field.css';

const DefaultShirt = ({ player }) => {
      return (
        <div className="default-shirt-container">
          <img src="/default-shirt.png" className="default-shirt" alt="default-shirt" />
        </div>
      );
    }
    const PlayerShirt = ({ player, onRemove, isHomePage }) => {
      const handleRemove = () => {
        onRemove(player);
      };
      const playerName = player.lastName.length > 16 ? player.firstName : player.lastName;
    
      return (
        <div className="real-player-shirt-container">
          <div className="real-shirt-container-1">
            <div className="real-shirt-container-2">
            {isHomePage && (
              <div className="information-player">
                <svg width="11" height="11" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="12" transform="translate(0 0.00158691)" fill="#ECC435" />
                  <rect x="5" y="2.00159" width="2" height="2" fill="white" />
                  <rect x="5" y="5.00159" width="2" height="5" fill="white" />
                </svg>
              </div>
            )}
              <div className="real-shirt">
                <img src={`/${player.club}.png`} alt="" className="club-shirt" />
              </div>
              {isHomePage && (
              <div className="close-player" onClick={handleRemove}>
                <svg width="11" height="11" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="12" height="12.0016" fill="#ECC435" />
                  <rect width="2.26273" height="9.05092" transform="matrix(0.707103 0.707111 -0.707103 0.707111 8.40015 2.00159)" fill="white" />
                  <rect width="1.98588" height="9.05092" transform="matrix(-0.707103 0.707111 -0.707103 -0.707111 9.8042 8.40002)" fill="white" />
                </svg>
              </div>
              )}
            </div>
            <div className="real-shirt-container-2-name">
              {playerName}
            </div>
          </div>
        </div>
      );
    };


const Field = ({ selectedPlayer, userId, isClearTeamRequested, onClearTeam, isHomePage}) => {

    const [currentFormation, setCurrentFormation] = useState(["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]) 
    const [playerLineup, setPlayerLineup] = useState(currentFormation)
    const [selectedFormation, setSelectedFormation] = useState("fourThreeThree");
    const [totalBudget, setTotalBudget] = useState(1000);
    const [totalPoints, setTotalPoints] = useState(0);
    const [isInitialRender, setIsInitialRender] = useState(true);
   
    useEffect(() => {
      if (isClearTeamRequested) {
        setPlayerLineup(currentFormation);
        setTotalBudget(1000); // Reset totalBudget to the initial value
        setTotalPoints(0); // Reset totalPoints to zero
        onClearTeam(); // Callback to reset isClearTeamRequested in the parent component
      }
    }, [isClearTeamRequested]);
   
    const fetchUserLineup = async (userId) => {
      try {
        const response = await fetch(`http://localhost:3000/getUserLineup/${userId}`);
        if (response.ok) {
          const data = await response.json();
          
          const { formation, playerLineup, selectedFormation, totalBudget, totalPoints } = data;
        
          
          setCurrentFormation(formation);
          setPlayerLineup(JSON.parse(playerLineup));
          setSelectedFormation(selectedFormation);
          setTotalBudget(totalBudget);
          setTotalPoints(totalPoints)

          
          document.getElementById('formationSelect').value = selectedFormation;

        } else {
          console.error('Failed to fetch user lineup:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user lineup:', error.message);
      }
    };

    useEffect(() => {
      if (userId) {
        fetchUserLineup(userId);
      }
    }, [userId]);
  
    
    const updateLineupInDatabase = async () => {
      try {
        const response = await fetch(`http://localhost:3000/updateLineup/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formation: currentFormation,
            selectedFormation: selectedFormation,
            playerLineup: JSON.stringify(playerLineup), // Convert to JSON string
            totalBudget: totalBudget,
            totalPoints: totalPoints,
          }),
        });
        
        if (response.ok) {
          console.log('Lineup and formation updated successfully in the database.');
        } else {
          console.error('Failed to update lineup and formation in the database:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating lineup and formation in the database:', error.message);
      }
    };
   
    const handleRemove = (removedPlayer) => {
      // Create a temporary lineup based on the current state
      
      const tempLineup = [...playerLineup];
    
      // Find the index of the removed player in the lineup
      const removedPlayerIndex = tempLineup.findIndex((player) => player === removedPlayer);
    
      // Replace the removed player with the default position based on its type
      const defaultPosition = getDefaultPosition(removedPlayer);
      tempLineup[removedPlayerIndex] = defaultPosition;
      
      // Create a temporary budget variable
      let tempBudget = totalBudget + (removedPlayer.price || 0);
      setTotalPoints((prevPoints) => prevPoints - (removedPlayer.points || 0));

      // Set the playerLineup state with the temporary lineup
      setPlayerLineup(tempLineup);
    
      // Update the total budget state
      setTotalBudget(tempBudget);
     

    };
    
    
    // Function to get the default position based on the player's type
    const getDefaultPosition = (player) => {
      if (player && player.position) {
        // Check the player's position and return the corresponding default position
        switch (player.position) {
          case "FWD":
            return "FWD";
          case "MID":
            return "MID";
          case "DEF":
            return "DEF";
          case "GK":
            return "GK";
          default:
            return "FWD"; // Default to "FWD" if the position is not recognized
        }
      }
      return "FWD"; // Default to "FWD" if the player or position is not provided
    };
    
  
    useEffect(() => {
        if (selectedPlayer) {
     
            let newLineup;
            let lastNameMatch = false;
    
            setPlayerLineup((prevLineup) => {
                newLineup = [...prevLineup];
            
                for (let i = 0; i < newLineup.length; i++) {
                    if (selectedPlayer.lastName === newLineup[i].lastName) {
                        lastNameMatch = true;
                        break;
                    }
                }
                if (lastNameMatch) {
                    return newLineup;
                }
                for (let i = 0; i < newLineup.length; i++) {
                    if (newLineup[i] === selectedPlayer.position && totalBudget >= (selectedPlayer.price || 0)) {
                        newLineup[i] = selectedPlayer;
                        setTotalBudget((prevBudget) => prevBudget - (selectedPlayer.price || 0));
                        setTotalPoints((prevPoints) => prevPoints + (selectedPlayer.points || 0));
                        break;
                    }
                }
                return newLineup;
            });
          }
        
        }, [selectedPlayer]);
      
    
      const handleFormationChange = (e) => {
        const selectedFormation = e.target.value;
        setSelectedFormation(selectedFormation);
    
        // Set the currentFormation based on the selectedFormation
        let newFormation;
        switch (selectedFormation) {
            case "fourThreeThree":
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
                break;
            case "threeFivetwo":
                newFormation = ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD"];
                break;
            case "threeFourThree":
                newFormation = ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
                break;
            case "fourFourTwo":
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"];
                break;
            default:
                newFormation = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]; // Default to 4-3-3
        }
        let tempBudget = 1000; // Assuming 1000 is the initial budget, update it accordingly
        let points = 0;

        setTotalBudget(tempBudget);

        setTotalPoints(points)

        setCurrentFormation(newFormation);

        setPlayerLineup(newFormation);
      
     
    };  


if (playerLineup.length === 0) {
  setPlayerLineup(currentFormation)
}

    let Lineup = playerLineup.map((position, index) => {
    
        const player = playerLineup[index];
        
        

        if (position === "FWD") {
          return (
            <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "MID") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "DEF") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else if (position === "GK") {
          return (
              <DefaultShirt player={player} key={index}/>
          );
        } else {
            return(
             <PlayerShirt player={player} key={index} onRemove={handleRemove} isHomePage={isHomePage} />
            )
        }
      });
      let Forward = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "FWD" || shirt.props.player.position === "FWD"));
      let Midfield = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "MID" || shirt.props.player.position === "MID"));
      let Defense = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "DEF" || shirt.props.player.position === "DEF"));
      let Goalkeepr = Lineup.filter((shirt) => shirt.props.player && (shirt.props.player === "GK" || shirt.props.player.position === "GK"));
    

      useEffect(() => {
        if (isInitialRender) {
          // This block will run only during the initial render
          setIsInitialRender(false);
        } else {
          // This block will run on subsequent renders
          updateLineupInDatabase();
        }
      }, [playerLineup, selectedPlayer, selectedFormation, totalBudget, totalPoints]);
    
  

      return (
        <>
         {isHomePage && (
          <div className="team-stats">
            <div>
              <strong>Team Budget:</strong> {totalBudget}
            </div>
            <div>
              <strong>Team Points:</strong> {totalPoints}
            </div>
          </div>
         )}
       {isHomePage && (
          <div className="formation-dropdown">
            <label htmlFor="formationSelect"></label>
            <select id="formationSelect" onChange={handleFormationChange}>
              <option value="fourThreeThree">4-3-3</option>
              <option value="fourFourTwo">4-4-2</option>
              <option value="threeFivetwo">3-5-2</option>
              <option value="threeFourThree">3-4-3</option>
            </select>
          </div>
       )}
          <div className="field-container">
            <div className="field-lines">
                <div className="field-FWD-line">
                    {Forward}
                </div>
                <div className="field-MID-line">
                    {Midfield}
                </div>
                <div className="field-DEF-line">
                        {Defense}
                </div>
                <div className="field-GK-line">
                    {Goalkeepr}
                </div>
            </div>    
        </div>
     </>
      );
    };
    
    export default Field;

