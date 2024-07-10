
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    team_name VARCHAR(50) NOT NULL
);


----------- Game Leagues ----------------


CREATE TABLE teams (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
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
    league_code NUMERIC(5, 0) UNIQUE NOT NULL,
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

CREATE TABLE private_leagues (
    league_id SERIAL PRIMARY KEY,
    league_name VARCHAR(20) NOT NULL,
    league_code NUMERIC(5, 0) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    start_round INT CHECK (start_round BETWEEN 1 AND 38),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

CREATE TABLE private_prediction_members (
    user_id INT NOT NULL,
    league_id INT NOT NULL,
    league_points INT DEFAULT 0,
    PRIMARY KEY (user_id, league_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (league_id) REFERENCES private_leagues(league_id)
);

CREATE TABLE global_prediction_members (
    user_id INT NOT NULL,
    league_points INT DEFAULT 0,
    PRIMARY KEY (user_id)
);

CREATE TABLE private_prediction_round_points (
    user_id INTEGER NOT NULL,
    league_id INT NOT NULL,
    round_num INTEGER NOT NULL,
    points INTEGER NOT NULL,
    PRIMARY KEY (user_id, league_id, round_num),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE global_prediction_round_points (
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
    team_1_result INT DEFAULT 30,
    team_2_result INT DEFAULT 30,
    round_num INT NOT NULL
);


CREATE TABLE private_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    league_id INT NOT NULL,
    round_num INT NOT NULL,
    private_league_ai INT DEFAULT 0,
    team_1_result INT,
    team_2_result INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE global_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    round_num INT NOT NULL,
    global_league_ai INT DEFAULT 0,
    team_1_result INT,
    team_2_result INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

-----------------------

CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE player_stats (
    stat_id SERIAL PRIMARY KEY,
    player_id INT NOT NULL REFERENCES players(player_id),
    matches_played INT NOT NULL,
    goals INT NOT NULL,
    assists INT NOT NULL,
    // Other stats columns
);
