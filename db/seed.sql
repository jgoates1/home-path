INSERT INTO user_info 
(email, username, password, push_notifications_flag, current_savings, archetype)
VALUES 
('john.doe@email.com', 'johndoe', 'hashedpassword123', TRUE, 25000.00, 'Planner'),
('sarah.smith@email.com', 'sarahsmith', 'hashedpassword456', FALSE, 12000.00, 'Explorer');

INSERT INTO survey_questions (question_text)
VALUES 
('What is your annual household income before taxes?'),
('How much have you saved (or expect to save) for a down payment?'),
('Do you know where you''d like to buy a home?'),
('When are you hoping to buy your first home?'),
('What best describes your current housing situation?');

INSERT INTO user_responses (user_id, question_id, response, date_submitted)
VALUES
(1, 1, '$85,000', CURRENT_TIMESTAMP),
(1, 2, '$25,000', CURRENT_TIMESTAMP),
(1, 3, 'Yes - Austin, TX', CURRENT_TIMESTAMP),
(1, 4, 'Within 12 months', CURRENT_TIMESTAMP),
(1, 5, 'Renting an apartment', CURRENT_TIMESTAMP),

(2, 1, '$65,000', CURRENT_TIMESTAMP),
(2, 2, '$12,000', CURRENT_TIMESTAMP),
(2, 3, 'Still deciding', CURRENT_TIMESTAMP),
(2, 4, '2-3 years from now', CURRENT_TIMESTAMP),
(2, 5, 'Living with family', CURRENT_TIMESTAMP);

INSERT INTO todo_items (todo_item_name)
VALUES 
('Find a good realtor'),
('Learn about getting pre-approved'),
('Check your credit score'),
('Get pre-approved for a mortgage'),
('Make an offer on a home');

INSERT INTO steps 
(user_id, step_order, step_name, step_due_date)
VALUES
(1, 1, 'Financial Preparation', CURRENT_TIMESTAMP + INTERVAL '30 days'),
(1, 2, 'Loan Approval', CURRENT_TIMESTAMP + INTERVAL '60 days'),
(1, 3, 'Home Search', CURRENT_TIMESTAMP + INTERVAL '120 days'),
(2, 1, 'Build Savings Plan', CURRENT_TIMESTAMP + INTERVAL '90 days'),
(2, 2, 'Credit Improvement', CURRENT_TIMESTAMP + INTERVAL '120 days');

INSERT INTO user_todos
(user_id, todo_id, step_id, reminder_date, due_date, current_status)
VALUES
(1, 1, 3, CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '100 days', 'Pending'),
(1, 2, 2, CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '45 days', 'InProgress'),
(1, 3, 1, CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '20 days', 'Completed'),
(1, 4, 2, CURRENT_TIMESTAMP + INTERVAL '21 days', CURRENT_TIMESTAMP + INTERVAL '55 days', 'Pending'),
(1, 5, 3, CURRENT_TIMESTAMP + INTERVAL '90 days', CURRENT_TIMESTAMP + INTERVAL '150 days', 'Pending'),
(2, 3, 5, CURRENT_TIMESTAMP + INTERVAL '15 days', CURRENT_TIMESTAMP + INTERVAL '60 days', 'Pending'),
(2, 2, 4, CURRENT_TIMESTAMP + INTERVAL '20 days', CURRENT_TIMESTAMP + INTERVAL '75 days', 'Pending');