
--- Trigger for generating a league code

DROP TRIGGER IF EXISTS generate_league_code_trigger ON private_leagues;

CREATE OR REPLACE FUNCTION generate_league_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate a random 5-digit number
    NEW.league_code := LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_league_code_trigger
BEFORE INSERT ON private_leagues
FOR EACH ROW
EXECUTE FUNCTION generate_league_code();

CREATE TRIGGER generate_league_code_trigger
BEFORE INSERT ON private_leagues
FOR EACH ROW
EXECUTE FUNCTION generate_league_code();


----------------------------------------------------



--- Triggers for league inserts 

CREATE OR REPLACE FUNCTION update_prediction_points() 
RETURNS TRIGGER AS $$
DECLARE
    pred RECORD;
BEGIN
    -- Loop through private_predictions
    FOR pred IN
        SELECT * FROM private_predictions WHERE game_id = NEW.game_id
    LOOP
        PERFORM update_points(pred.user_id, pred.league_id, pred.round_num, pred.team_1_result, pred.team_2_result, NEW.team_1_result, NEW.team_2_result, 'private');
    END LOOP;
    
    -- Loop through global_predictions
    FOR pred IN
        SELECT * FROM global_predictions WHERE game_id = NEW.game_id
    LOOP
        PERFORM update_points(pred.user_id, NULL, pred.round_num, pred.team_1_result, pred.team_2_result, NEW.team_1_result, NEW.team_2_result, 'global');
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update points
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

    -- Correct prediction
    IF pred_team1 = actual_team1 AND pred_team2 = actual_team2 THEN
        total_points := 10;
    
    -- Wrong score but correct outcome
    ELSIF (pred_team1 > pred_team2 AND actual_team1 > actual_team2) OR
          (pred_team1 < pred_team2 AND actual_team1 < actual_team2) OR
          (pred_team1 = pred_team2 AND actual_team1 = actual_team2) THEN
        total_points := 5;
    
    -- Attempt points
    ELSE
        total_points := 1;
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


CREATE TRIGGER after_game_update
AFTER UPDATE OF team_1_result, team_2_result
ON games
FOR EACH ROW
EXECUTE FUNCTION update_prediction_points();
