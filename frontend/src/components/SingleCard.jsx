import React from 'react';
import '../styles/cards.css'

function Card() {
  
    
    return (
      <div className="container">
        <div className="teams-card-container">
         <div className="first-second-column-teams-card">    
           <div className="teams-card">
             <div className="card-header">
                <img src="https://assets.codepen.io/285131/pl-logo.svg" alt="league" />
                <p>English Premier League</p>
            </div>

            <div className="card-contents">
                <div className="column-first-team">
                  <img src="https://assets.codepen.io/285131/chelsea.svg" alt="first" />
                  <p>Chelsea</p>
                </div>

                <div className="column-match-result">
                    <div className="match-date">
                       <p> 3 May at <strong>17:30</strong></p>
                    </div>
                    <div className="match-score">
                       <span className="match-score-number">3</span>
                       <span className="match-score-divider">:</span>
                       <span className="match-score-number">1</span>  
                    </div>
                    <button className="prediction-btn"> Make Prediction </button>
                </div>
                        
                <div className="column-second-team">
                   <img src="https://resources.premierleague.com/premierleague/badges/t1.svg" alt="second" />
                   <p>Man Utd</p>
                </div>
            
           </div>
        </div>
                
          </div>
         </div>
        </div>
    );
   
}

export default Card