
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    team_name VARCHAR(50) NOT NULL
);


----------- Game Leagues ----------------



 CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    formation JSONB NOT NULL,
    player_lineup JSONB NOT NULL,
    total_budget INTEGER NOT NULL,
    total_points INTEGER NOT NULL
);


CREATE TABLE league_members (
    user_id INT NOT NULL,
    league_id INT NOT NULL,  -- For Global league every use will deposited once they make a team the league_id will be a 0. 
	league_points INT DEFAULT 0,
    PRIMARY KEY (user_id, league_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (league_id) REFERENCES private_leagues(league_id)
);

CREATE TABLE private_leagues (
    league_id SERIAL PRIMARY KEY,
    league_name VARCHAR(20) NOT NULL,
    league_code VARCHAR(9) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    start_round INT CHECK (start_round BETWEEN 1 AND 38),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

CREATE TABLE game_round_points (
    user_id INTEGER NOT NULL,          
    round_num INTEGER NOT NULL,        
    points INTEGER NOT NULL,      
    PRIMARY KEY (user_id, round_num),  
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
);

CREATE TABLE player_round_points (
    player_id SERIAL PRIMARY KEY,  
    first_name VARCHAR(50) NOT NULL,  
    last_name VARCHAR(50) NOT NULL,
    round_num INTEGER NOT NULL,  
    round_points INTEGER NOT NULL, 
    CONSTRAINT unique_player_round UNIQUE (player_id, round_num)  
);



------------ Prediction Leagues ----------------


CREATE TABLE prediction_leagues (
    user_id INT NOT NULL,
    league_id INT NOT NULL,
	league_points INT DEFAULT 0, -- Adds the points from prediciton round points for every user
    PRIMARY KEY (user_id, league_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (league_id) REFERENCES private_leagues(league_id)
);


CREATE TABLE prediction_round_points (
    user_id INTEGER NOT NULL,          
    round_num INTEGER NOT NULL,        
    points INTEGER NOT NULL,      
    PRIMARY KEY (user_id, round_num),  
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
);


CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    game_date DATE NOT NULL,
    team_1 VARCHAR(100) NOT NULL,
    team_2 VARCHAR(100) NOT NULL,
    team_1_result INT default 0  -- Stores the result once the game is over
    team_2_result INT default 0 -- Stores the result once the game is over\
);

CREATE TABLE privated_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    round_num INT NOT NULL, 
    private_league_ai INT DEFAULT 0, -- Limit to 1
    team_1_result
    team_2_result
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE golbal_predicitons (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    round_num INT NOT NULL, -- 
    global_league_ai INT DEFAULT 0, -- Limit to 1
    team_1_result
    team_2_result
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);
