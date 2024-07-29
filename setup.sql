
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
    round_num INTEGER NOT NULL,  
    points INTEGER NOT NULL DEFAULT 0,
    delete_count INTEGER NOT NULL DEFAULT 0,
    change_count INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE league_members (
    user_id INT NOT NULL,
    league_id INT NOT NULL,  -- For Global league every use will deposited once they make a team the league_id will be a 0. 
	league_points INT DEFAULT 0,
    PRIMARY KEY (user_id, league_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (league_id) REFERENCES private_leagues(league_id)
);

CREATE TABLE fantasy_private_leagues (
    league_id SERIAL PRIMARY KEY,
    league_name VARCHAR(20) NOT NULL,
    league_code NUMERIC(5, 0) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    start_round INT CHECK (start_round BETWEEN 1 AND 38),
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

CREATE TABLE fantasy_points (
    user_id INTEGER NOT NULL,                
    points INTEGER NOT NULL,      
    PRIMARY KEY (user_id),  
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
);

CREATE TABLE player_rounds (
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    round_num INTEGER NOT NULL,
    round_points INTEGER NOT NULL DEFAULT 0,
    round_price INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (first_name, last_name, round_num)
);

CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_points INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT unique_player_name UNIQUE (first_name, last_name)
);


------------ Prediction Leagues ----------------

CREATE TABLE private_prediction_leagues (
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

CREATE TABLE private_prediction_options ( -- Type of predicion in the private chosen by owner
    option_id SERIAL PRIMARY KEY,
    league_id INTEGER NOT NULL,
    round_num INTEGER NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    submitted BOOLEAN DEFAULT false, -- Add the submitted column here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (league_id, round_num)
);

CREATE TABLE private_prediction_choose_cards ( -- For the starred games
    owner_id INT NOT NULL,
    game_id INT NOT NULL,
    league_id INT NOT NULL,
    round_num INT NOT NULL,
    PRIMARY KEY (owner_id, game_id, league_id, round_num)
);


---------------- Rounds ------------------

CREATE TABLE round_status (
    round_num INTEGER NOT NULL,
    finished BOOLEAN NOT NULL DEFAULT FALSE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT unique_round_num UNIQUE (round_num)
);
