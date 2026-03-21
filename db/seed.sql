INSERT INTO users 
(email, username, password, push_notifications_flag, current_savings, target_savings, archetype)
VALUES 
('john.doe@email.com', 'johndoe', '$2b$10$BPOxPo.urJ6RZKwu.urr6.meP.b7S9o7rXIGszT/2s26zsllo7V9W', TRUE, 25000.00, 60000.00, 'Planner'),
('sarah.smith@email.com', 'sarahsmith', '$2b$10$PY4zEClRPa74iHciIvFnruv7Rmaq/b1OmYo6v05oPUAa40vyio0am', FALSE, 12000.00, 40000.00, 'Explorer');

INSERT INTO steps 
(user_id, step_number, step_name, step_goal_date)
VALUES
(1, 1, 'Get Your Finances Ready', CURRENT_TIMESTAMP + INTERVAL '30 days'),
(1, 2, 'Get Pre-Approved', CURRENT_TIMESTAMP + INTERVAL '60 days'),
(1, 3, 'Find Your Home', CURRENT_TIMESTAMP + INTERVAL '120 days'),
(1, 4, 'Close the Deal', CURRENT_TIMESTAMP + INTERVAL '180 days'),
(2, 1, 'Get Your Finances Ready', CURRENT_TIMESTAMP + INTERVAL '90 days'),
(2, 2, 'Get Pre-Approved', CURRENT_TIMESTAMP + INTERVAL '120 days'),
(2, 3, 'Find Your Home', CURRENT_TIMESTAMP + INTERVAL '210 days'),
(2, 4, 'Close the Deal', CURRENT_TIMESTAMP + INTERVAL '330 days');

INSERT INTO todo_items
(step_id, todo_number, todo_description, is_done)
VALUES
-- Step 1: Get Your Finances Ready (John)
(1, 1, 'Review your credit report and dispute any errors', FALSE),
(1, 2, 'Pay down outstanding credit card balances', FALSE),
(1, 3, 'Set up a dedicated savings account for your down payment', TRUE),
(1, 4, 'Calculate your monthly budget and identify areas to cut spending', TRUE),

-- Step 2: Get Pre-Approved (John)
(2, 1, 'Research and compare at least three mortgage lenders', FALSE),
(2, 2, 'Gather required documents: tax returns, pay stubs, and bank statements', FALSE),
(2, 3, 'Submit pre-approval applications to your top two lenders', FALSE),
(2, 4, 'Review and compare pre-approval offers and lock in your rate', FALSE),

-- Step 3: Find Your Home (John)
(3, 1, 'Write a list of must-haves vs. nice-to-haves for your new home', FALSE),
(3, 2, 'Interview and select a real estate agent', FALSE),
(3, 3, 'Attend at least five open houses in your target neighborhoods', FALSE),
(3, 4, 'Submit an offer on your chosen home', FALSE),

-- Step 4: Close the Deal (John)
(4, 1, 'Schedule and attend a professional home inspection', FALSE),
(4, 2, 'Review inspection results and negotiate repairs with the seller', FALSE),
(4, 3, 'Secure homeowners insurance before closing', FALSE),
(4, 4, 'Do a final walkthrough and sign closing documents', FALSE),

-- Step 5: Get Your Finances Ready (Sarah)
(5, 1, 'Pull your credit score from all three bureaus', FALSE),
(5, 2, 'Open a high-yield savings account for your down payment fund', FALSE),
(5, 3, 'Create a 6-month savings plan with monthly contribution targets', FALSE),
(5, 4, 'Meet with a financial advisor to review your home-buying readiness', FALSE),

-- Step 6: Get Pre-Approved (Sarah)
(6, 1, 'Research first-time homebuyer loan programs in your state', FALSE),
(6, 2, 'Collect W-2s, tax returns, and recent pay stubs', FALSE),
(6, 3, 'Apply for pre-approval with two or three lenders', FALSE),
(6, 4, 'Choose the best pre-approval offer and get a pre-approval letter', FALSE),

-- Step 7: Find Your Home (Sarah)
(7, 1, 'Research neighborhoods that fit your lifestyle and commute needs', FALSE),
(7, 2, 'Find and hire a real estate agent', FALSE),
(7, 3, 'Tour homes and track pros and cons for each', FALSE),
(7, 4, 'Make an offer on your preferred home', FALSE),

-- Step 8: Close the Deal (Sarah)
(8, 1, 'Order a home inspection and review the report carefully', FALSE),
(8, 2, 'Negotiate any repairs or credits with the seller', FALSE),
(8, 3, 'Finalize your mortgage and complete all lender conditions', FALSE),
(8, 4, 'Attend closing, sign all documents, and get your keys', FALSE);

INSERT INTO tips
(step_id, tip_number, tip_text)
VALUES
-- Step 1: Get Your Finances Ready (John)
(1, 1, 'A credit score of 620+ is typically needed for a conventional loan.'),
(1, 2, 'Try to keep your credit utilization below 30% for the best score impact.'),
(1, 3, 'Avoid opening new lines of credit while preparing to buy a home.'),
(1, 4, 'Most lenders recommend keeping housing costs under 28% of gross income.'),

-- Step 2: Get Pre-Approved (John)
(2, 1, 'Pre-approval is stronger than pre-qualification — always aim for pre-approval.'),
(2, 2, 'Multiple mortgage inquiries within 45 days count as a single credit hit.'),
(2, 3, 'A lower debt-to-income ratio (below 43%) will get you better loan terms.'),
(2, 4, 'Rate locks typically last 30–60 days, so time them close to your offer.'),

-- Step 3: Find Your Home (John)
(3, 1, 'Location affects resale value more than almost any other factor.'),
(3, 2, 'Check school district ratings even if you don''t have kids — it affects resale.'),
(3, 3, 'Visit neighborhoods at different times of day before committing.'),
(3, 4, 'Don''t skip a home inspection even in a competitive market.'),

-- Step 4: Close the Deal (John)
(4, 1, 'Closing costs typically run 2–5% of the loan amount — budget for them early.'),
(4, 2, 'Review the Closing Disclosure carefully and compare it to your Loan Estimate.'),
(4, 3, 'Wire fraud is common at closing — always verify account info by phone.'),
(4, 4, 'You''ll need a cashier''s check or wire transfer ready on closing day.'),

-- Step 5: Get Your Finances Ready (Sarah)
(5, 1, 'Check your credit report for free at AnnualCreditReport.com once a year.'),
(5, 2, 'Even small monthly savings add up — automate transfers to stay consistent.'),
(5, 3, 'Some down payment assistance programs require 3–6 months of saving history.'),
(5, 4, 'Lenders will look at 2 years of income history, so avoid job changes now.'),

-- Step 6: Get Pre-Approved (Sarah)
(6, 1, 'FHA loans allow down payments as low as 3.5% with a 580+ credit score.'),
(6, 2, 'Self-employed buyers may need extra documentation like profit and loss statements.'),
(6, 3, 'Getting pre-approved by multiple lenders helps you negotiate a better rate.'),
(6, 4, 'Your pre-approval letter should reflect a comfortable budget, not the max amount.'),

-- Step 7: Find Your Home (Sarah)
(7, 1, 'Buyer''s agents are typically free to you — their commission is paid by the seller.'),
(7, 2, 'Look beyond the listing photos — always tour in person before making an offer.'),
(7, 3, 'Research recent comparable sales to know if a listing is fairly priced.'),
(7, 4, 'An escalation clause can help you win in a bidding war without overbidding upfront.'),

-- Step 8: Close the Deal (Sarah)
(8, 1, 'Ask your inspector to walk you through findings in person, not just in the report.'),
(8, 2, 'Request repair credits instead of fixes — you can choose your own contractors.'),
(8, 3, 'Don''t make large purchases or open new credit accounts before closing.'),
(8, 4, 'Bring a valid photo ID and a cashier''s check for closing costs on signing day.');