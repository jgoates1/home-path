-- Seed data (aligned with current schema.sql)

INSERT INTO user_info
  (email, username, password, push_notifications_flag, current_savings, archetype)
VALUES
  ('john.doe@email.com', 'johndoe', '$2b$10$BPOxPo.urJ6RZKwu.urr6.meP.b7S9o7rXIGszT/2s26zsllo7V9W', TRUE, 25000.00, 'Planner'),
  ('sarah.smith@email.com', 'sarahsmith', '$2b$10$PY4zEClRPa74iHciIvFnruv7Rmaq/b1OmYo6v05oPUAa40vyio0am', FALSE, 12000.00, 'Explorer');

INSERT INTO steps
  (user_id, step_order, step_name, step_due_date)
VALUES
  (1, 1, 'Get Your Finances Ready', CURRENT_TIMESTAMP + INTERVAL '30 days'),
  (1, 2, 'Get Pre-Approved', CURRENT_TIMESTAMP + INTERVAL '60 days'),
  (1, 3, 'Find Your Home', CURRENT_TIMESTAMP + INTERVAL '120 days'),
  (1, 4, 'Close the Deal', CURRENT_TIMESTAMP + INTERVAL '180 days'),
  (2, 1, 'Get Your Finances Ready', CURRENT_TIMESTAMP + INTERVAL '90 days'),
  (2, 2, 'Get Pre-Approved', CURRENT_TIMESTAMP + INTERVAL '120 days'),
  (2, 3, 'Find Your Home', CURRENT_TIMESTAMP + INTERVAL '210 days'),
  (2, 4, 'Close the Deal', CURRENT_TIMESTAMP + INTERVAL '330 days');

INSERT INTO todo_items (todo_item_name) VALUES
  ('Review your credit report and dispute any errors'),
  ('Pay down outstanding credit card balances'),
  ('Set up a dedicated savings account for your down payment'),
  ('Calculate your monthly budget and identify areas to cut spending'),
  ('Research and compare at least three mortgage lenders'),
  ('Gather required documents: tax returns, pay stubs, and bank statements'),
  ('Submit pre-approval applications to your top two lenders'),
  ('Review and compare pre-approval offers and lock in your rate');

-- Example user_todos for John (user_id=1) on step 1
INSERT INTO user_todos (user_id, todo_id, step_id, current_status)
VALUES
  (1, 1, 1, 'Pending'),
  (1, 2, 1, 'Pending'),
  (1, 3, 1, 'Completed'),
  (1, 4, 1, 'Completed');

INSERT INTO survey_questions (question_text) VALUES
  ('What is your annual household income?'),
  ('How much do you currently have saved for a down payment?'),
  ('What city or area are you looking to buy in?'),
  ('When are you hoping to buy a home?'),
  ('What is your current housing situation?');