CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    push_notifications_flag BOOLEAN DEFAULT FALSE,
    current_savings DECIMAL(12,2) DEFAULT 0.00,
    target_savings DECIMAL(12,2) DEFAULT 50000.00,
    archetype VARCHAR(20)
);

CREATE TABLE steps (
    step_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    step_number INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    step_goal_date TIMESTAMP,

    CONSTRAINT fk_steps_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_step_name
        UNIQUE (user_id, step_name),

    CONSTRAINT unique_user_step_order
        UNIQUE (user_id, step_number)
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