import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { decodeJWT } from '../jwtUtils.js';
import '../styles/Rules.css';
import Navbar from '../components/Navbar.jsx';

const Rules = () => {
  const location = useLocation();
  const decodedToken = decodeJWT();
  const userId = decodedToken?.userId;

  const tabs = ['How to play', 'Rules', 'FAQ'];
  const sideNavs = {
    'How to play': ['Welcome', 'Build your team', 'Personal details', 'Become a member', 'Teams'],
    'Rules': ['Team & formations', 'Budget & player price changes', 'Transfers & substitutions', 'Automatic substitutions', 'Performance data', 'Results update', 'Common Leagues', 'Private Leagues'],
    'FAQ': ['General Questions']
  };

  const getCurrentTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'How to play';
  };

  const currentTab = getCurrentTab();

  // const [openFAQ, setOpenFAQ] = useState(false);

  return (
    <div>
      <Navbar />
      <div className='rules-container'>
           {/* 
        <h2>Rules & FAQ</h2>
        <div className='mini-navbar'>
          {tabs.map(tab => (
            <Link 
              key={tab} 
              to={`?tab=${tab}`} 
              className={currentTab === tab ? 'active' : ''}
            >
              {tab}
            </Link>
          ))}
        </div>
        <div className='content-containerR'>
          <div className='side-navbar'>
            <h3>Content</h3>
            {sideNavs[currentTab].map(item => (
              <a href={`#${item.replace(/\s+/g, '-')}`} key={item}>{item}</a>
            ))}
          </div>
          <div className='main-content'>
            {currentTab === 'How to play' && (
              <>
                <section id='Welcome'>
                  <h3>Welcome</h3>
                  <p>Welcome to SerieA Fantasy football website!</p>
                  <p>Our website brings you the best fantasy football experience. Demonstrate your knowledge of Italian Serie A football, challenge friends and win great prizes!</p>
                  <p>Sign up to start enjoying SerieA Fantasy experience in full.</p>
                </section>
                <section id='Build-your-team'>
                  <h3>Build your team</h3>
                  <p>Your team can be assembled from all available players across the 20 clubs competing in Serie A.</p>
                  <p>Players can be selected using filters such as football club, position on the pitch, sorting by price, points, or any other player statistic.</p>
                  <p>The budget allotted to select a 15-man squad is €100M and progress can be tracked at all times during the team selection process.</p>
                  <p>Team can be further personalised by picking a suitable team name, formation, and assigning 1 of the players as a captain and 1 of the players as a vice-captain of your team.</p>
                  <p>For those that want to try their luck, 'Random Team' functionality is also available!</p>
                </section>
                <section id='Personal-details'>
                  <h3>Personal details</h3>
                  <p>Once the team building process is complete, personal details should be provided to finalise the registration process.</p>
                  <p>Please note that a valid email address should be entered to allow verification of your account. Email address cannot be changed after sign up.</p>
                </section>
                <section id='Become-a-member'>
                  <h3>Become a member</h3>
                  <p>After successful email verification, the full SerieA Fantasy Football experience will be at your fingertips.</p>
                  <p>Every team is added to common leagues automatically, with a chance to win great prizes. Winners must claim their prizes by contacting us at support@serieafantasy.com until the start of the upcoming round/Quad round.</p>
                  <p>Additionally, private leagues can be created to compete against your friends.</p>
                </section>
                <section id='Teams'>
                  <h3>Teams</h3>
                  <p>As the season progresses, your team can be customised for each upcoming round by making use of substitutions or transfers, as well as changing formation or the captain and vice-captain of your team.</p>
                  <p>Transfers allow you to bring new players into your team, while substitutions allow you to swap bench players with starting players.</p>
                  <p>Performance of your team in past rounds, or the round in progress, is available to view at all times.</p>
                </section>
              </>
            )}
            {currentTab === 'Rules' && (
              <>
                <section id='Team-&-formations'>
                  <h3>Team & formations</h3>
                  <p>Teams should consist of 15 players, broken down into 4 positions as follows:</p>
                  <ul>
                    <li>3 Forwards</li>
                    <li>5 Midfielders</li>
                    <li>5 Defenders</li>
                    <li>2 Goalkeepers</li>
                  </ul>
                  <p>Team should have 11 starting players at all times, and 4 substitutes. Hence possible formations include:</p>
                  <ul>
                    <li>3-4-3</li>
                    <li>3-5-2</li>
                    <li>4-3-3</li>
                    <li>4-4-2</li>
                    <li>4-5-1</li>
                    <li>5-3-2</li>
                    <li>5-4-1</li>
                  </ul>
                  <p>Team should have a captain assigned, who will then earn double the number of points for that round.</p>
                  <p>Team should also have a vice-captain assigned, who will earn double the number of points for that round if the captain has not featured yet in the round.</p>
                  <p>Up to 2 players can be selected from a single football club.</p>
                </section>
                <section id='Budget-&-player-price-changes'>
                  <h3>Budget & player price changes</h3>
                  <p>A €100M budget is allotted to select all 15 players for a fantasy team.</p>
  
                  <p>Budget and player prices may change after the start of season.</p>
  
                  <p>Price changes will be determined according to the performance of the football players. Price changes will enter into force after Round 1. Price changes will be made every round. Changes may not apply to all player prices.</p>
  
                  <p>Player prices will increase or decrease by €0.2 after each round. Threshold for maximum price is €15.0 and for minimum price is €3.0.</p>
  
                  <p>Users will be able to benefit from budget surpluses (greater than €100M) as a result of price increases. Users will be liable for budget deficits (lower than €100M) as a result of price declines.</p>
                </section>
                <section id='Transfers-&-substitutions'>
                  <h3>Transfers & substitutions</h3>
                  <p>Before the deadline of each round, a team can be prepared using transfers or substitutions, and you also have the option to change the captain and vice-captain of your team.</p>
                  <h4>Transfer rules</h4>
                  <p>You will receive 1 free transfer before the deadline of each round:</p>
                  <ul>
                    <li>If extra transfer(s) are completed on top of free transfer(s), then each additional transfer will deduct 5 points from the round score after all the matches in the round are completed.</li>
                    <li>If your free transfer is not used, then it will be carried over to the next round. The maximum number of accumulated transfers is 4.</li>
                  </ul>
                  <p>After the deadline of each round, the team is locked and no more player changes are allowed during that round.</p>
                  <h4>Unlimited Transfers</h4>
                  <p>Before their first deadline in the game, users are entitled to make unlimited transfers. No points will be deducted for these transfers.</p>
                  <p>During the season, Wildcard option will allow users to make unlimited transfers free of charge. Wildcard can be used only once a season.</p>
                  <h4>Football player transfers within Serie A</h4>
                  <p>In the case where a football player's transfer from one Serie A club to another Serie A club results in exceeding the 2 players per a single football club rule, the user will be required to comply with this rule in the next transfer usage.</p>
                </section>
                <section id='Automatic-substitutions'>
                  <h3>Automatic substitutions</h3>
                  <p>After all of the matches in a round are completed, automatic substitutions will then take place, based on the following rules:</p>
                  <ul>
                    <li>Substitutions occur based on the order of priority on the bench.</li>
                    <li>The player on the bench will substitute for the player on the pitch who has not featured in a match, provided that the bench player played in that match.</li>
                    <li>In the event of 2 potential bench players of the same position, the player with higher priority will be substituted in.</li>
                  </ul>
                </section>
                <section id='Performance-data'>
                  <h3>Performance data</h3>
                  <p>Below is the breakdown of performance data awarded to players by position</p>
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Goalkeeper</th>
                        <th>Defender</th>
                        <th>Midfielder</th>
                        <th>Forward</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Minutes played <i>from 1 to 30</i></td>
                        <td>1</td>
                        <td>1</td>
                        <td>1</td>
                        <td>1</td>
                      </tr>
                      <tr>
                        <td>Minutes played <i>from 31 to 60</i></td>
                        <td>2</td>
                        <td>2</td>
                        <td>2</td>
                        <td>2</td>
                      </tr>
                      <tr>
                        <td>Minutes played <i>more than 60</i></td>
                        <td>3</td>
                        <td>3</td>
                        <td>3</td>
                        <td>3</td>
                      </tr>
                      <tr>
                        <td>Goal</td>
                        <td>5</td>
                        <td>6</td>
                        <td>5</td>
                        <td>4</td>
                      </tr>
                      <tr>
                        <td>Assist</td>
                        <td>2</td>
                        <td>3</td>
                        <td>3</td>
                        <td>5</td>
                      </tr>
                      <tr>
                        <td>Clean sheet</td>
                        <td>5</td>
                        <td>5</td>
                        <td>0</td>
                        <td>0</td>
                      </tr>
                      <tr>
                        <td>Yellow card</td>
                        <td>-1</td>
                        <td>-1</td>
                        <td>-1</td>
                        <td>-1</td>
                      </tr>
                      <tr>
                        <td>Red card</td>
                        <td>-3</td>
                        <td>-3</td>
                        <td>-3</td>
                        <td>-3</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </>
            )} 
          </div>
        </div>
        */}
      </div>
      <h2>Rules Coming Soon</h2>
    </div>
  );
  
};

export default Rules;
