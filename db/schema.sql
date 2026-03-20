-- HomePath schema (aligned with current server routes)

CREATE TABLE IF NOT EXISTS user_info (
  user_id                 SERIAL PRIMARY KEY,
  email                   VARCHAR(100) NOT NULL UNIQUE,
  username                VARCHAR(50) NOT NULL UNIQUE,
  password                VARCHAR(255) NOT NULL,
  push_notifications_flag BOOLEAN DEFAULT FALSE,
  current_savings         DECIMAL(12,2) DEFAULT 0.00,
  archetype               VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS steps (
  step_id       SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES user_info(user_id) ON DELETE CASCADE,
  step_order    INT NOT NULL,
  step_name     VARCHAR(50) NOT NULL,
  step_due_date TIMESTAMP,
  CONSTRAINT unique_user_step_name UNIQUE (user_id, step_name),
  CONSTRAINT unique_user_step_order UNIQUE (user_id, step_order)
);

CREATE TABLE todo_items (
	todo_id SERIAL PRIMARY KEY,
    step_id INT NOT NULL,
    todo_number INT NOT NULL,
    todo_description VARCHAR(500),
    is_done BOOL DEFAULT False,
        
	CONSTRAINT fk_todo_step
        FOREIGN KEY (step_id)
        REFERENCES steps(step_id)
        ON DELETE CASCADE
);

CREATE TABLE tips (
	tip_id SERIAL PRIMARY KEY,
    step_id INT NOT NULL,
    tip_number INT NOT NULL,
    tip_text VARCHAR(500),
        
	CONSTRAINT fk_tip_step
        FOREIGN KEY (step_id)
        REFERENCES steps(step_id)
        ON DELETE CASCADE
);