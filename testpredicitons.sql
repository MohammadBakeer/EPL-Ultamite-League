-- Delete all records from private_prediction_members
DELETE FROM private_prediction_members;

-- Delete all records from global_prediction_members
DELETE FROM global_prediction_members;

-- Delete all records from private_prediction_round_points
DELETE FROM private_prediction_round_points;

-- Delete all records from global_prediction_round_points
DELETE FROM global_prediction_round_points;

-- Delete all records from private_predictions
DELETE FROM private_predictions;

-- Delete all records from global_predictions
DELETE FROM global_predictions;


INSERT INTO private_predictions (user_id, game_id, league_id, round_num, team_1_result, team_2_result)
VALUES
    (201, 14, 1052, 1, 1, 1),
    (201, 15, 1052, 1, 1, 1);


INSERT INTO global_predictions (user_id, game_id, round_num, team_1_result, team_2_result)
VALUES
    (201, 14, 1, 1, 1),
    (201, 15, 1, 1, 1);

-- Insert new game between Liverpool and Fulham for round 1
INSERT INTO games (team_1, team_2, round_num, game_date)
VALUES ('Liverpool', 'Fulham', 1, '2024-07-11');

UPDATE games
SET team_1_result = 1, team_2_result = 1
WHERE game_id IN (14, 15);

