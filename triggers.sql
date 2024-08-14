
--- Trigger for generating a league code

DROP TRIGGER IF EXISTS generate_league_code_trigger ON private_prediction_leagues;

CREATE OR REPLACE FUNCTION generate_league_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate a random 5-digit number
    NEW.league_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_league_code_trigger
BEFORE INSERT ON private_prediction_leagues
FOR EACH ROW
EXECUTE FUNCTION generate_league_code();

-----------------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS generate_league_code_trigger ON fantasy_private_leagues;

CREATE OR REPLACE FUNCTION generate_league_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate a random 5-digit number
    NEW.league_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_league_code_trigger
BEFORE INSERT ON fantasy_private_leagues
FOR EACH ROW
EXECUTE FUNCTION generate_league_code();


----------------------------------------------------



-- Function to add user to global_prediction_members
CREATE OR REPLACE FUNCTION add_to_global_prediction_members()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into global_prediction_members
    INSERT INTO global_prediction_members (user_id)
    VALUES (NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute add_to_global_prediction_members after insert into users
CREATE TRIGGER after_user_creation
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION add_to_global_prediction_members();


-----------------------------------------------------------------------------



CREATE OR REPLACE FUNCTION update_fantasy_points()
RETURNS TRIGGER AS $$
DECLARE
    total_points INTEGER;
BEGIN
    -- Calculate the total points for the user
    SELECT SUM(points)
    INTO total_points
    FROM teams
    WHERE user_id = NEW.user_id;

    -- Insert or update the fantasy_points table with the total points
    INSERT INTO fantasy_points (user_id, points)
    VALUES (NEW.user_id, total_points)
    ON CONFLICT (user_id) 
    DO UPDATE SET points = EXCLUDED.points;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fantasy_points
AFTER INSERT OR UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_fantasy_points();

---------------------------------------------------------------------


CREATE OR REPLACE FUNCTION update_points(user_id INT, league_id INT, round_num INT, pred_team1 INT, pred_team2 INT, actual_team1 INT, actual_team2 INT, league_type TEXT)
RETURNS VOID AS $$
DECLARE
    total_points INT;
    table_name TEXT;
BEGIN
    total_points := 0;
    table_name := CASE league_type
                  WHEN 'private' THEN 'private_prediction_round_points'
                  WHEN 'global' THEN 'global_prediction_round_points'
                  ELSE NULL
                  END;

    -- Calculate points based on prediction accuracy
    IF pred_team1 = actual_team1 AND pred_team2 = actual_team2 THEN
        total_points := 10; -- Correct prediction
    ELSIF (pred_team1 > pred_team2 AND actual_team1 > actual_team2) OR
          (pred_team1 < pred_team2 AND actual_team1 < actual_team2) OR
          (pred_team1 = pred_team2 AND actual_team1 = actual_team2) THEN
        total_points := 5;  -- Correct outcome but not exact score
    ELSE
        total_points := 2;  -- Attempt points
    END IF;

    -- Update or insert points for private or global predictions
    IF league_type = 'private' THEN
        EXECUTE format('INSERT INTO %I (user_id, league_id, round_num, points) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, league_id, round_num) DO UPDATE SET points = %I.points + $4', table_name, table_name)
        USING user_id, league_id, round_num, total_points;
    ELSE
        EXECUTE format('INSERT INTO %I (user_id, round_num, points) VALUES ($1, $2, $3) ON CONFLICT (user_id, round_num) DO UPDATE SET points = %I.points + $3', table_name, table_name)
        USING user_id, round_num, total_points;
    END IF;
    
    -- Update league_points in private_prediction_members or global_prediction_members
    IF league_type = 'private' THEN
        EXECUTE 'UPDATE private_prediction_members SET league_points = league_points + $1 WHERE user_id = $2 AND league_id = $3'
        USING total_points, user_id, league_id;
    ELSE
        EXECUTE 'UPDATE global_prediction_members SET league_points = league_points + $1 WHERE user_id = $2'
        USING total_points, user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the update_prediction_points function
CREATE OR REPLACE FUNCTION update_prediction_points() 
RETURNS TRIGGER AS $$
DECLARE
    pred_record RECORD;
BEGIN
    -- Call update_points for private_predictions
    FOR pred_record IN
        SELECT * FROM private_predictions WHERE game_id = NEW.game_id
    LOOP
        PERFORM update_points(pred_record.user_id, pred_record.league_id, pred_record.round_num, pred_record.team_1_result, pred_record.team_2_result, NEW.team_1_result, NEW.team_2_result, 'private');
    END LOOP;
    
    -- Call update_points for global_predictions
    FOR pred_record IN
        SELECT * FROM global_predictions WHERE game_id = NEW.game_id
    LOOP
        PERFORM update_points(pred_record.user_id, NULL, pred_record.round_num, pred_record.team_1_result, pred_record.team_2_result, NEW.team_1_result, NEW.team_2_result, 'global');
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE OR REPLACE TRIGGER after_game_update
AFTER UPDATE OF finished
ON games
FOR EACH ROW
WHEN (NEW.finished = TRUE)
EXECUTE FUNCTION update_prediction_points();
