-- Create the users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  team_name VARCHAR(50) NOT NULL
);

-- Create the teams table
CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  formation JSONB NOT NULL,
  player_lineup JSONB NOT NULL,
  selected_formation VARCHAR(50) NOT NULL,
  total_budget INTEGER NOT NULL,
  total_points INTEGER NOT NULL
);
