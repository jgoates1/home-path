CREATE TABLE user_info (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    push_notifications_flag BOOLEAN DEFAULT FALSE,
    current_savings DECIMAL(12,2) DEFAULT 0.00,
    archetype VARCHAR(20)
);

CREATE TABLE survey_questions (
    question_id SERIAL PRIMARY KEY,
    question_text VARCHAR(200) NOT NULL
);

CREATE TABLE user_responses (
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    response VARCHAR(100),
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, question_id),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES user_info(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_question
        FOREIGN KEY (question_id)
        REFERENCES survey_questions(question_id)
        ON DELETE CASCADE
);

CREATE TABLE todo_items (
    todo_id SERIAL PRIMARY KEY,
    todo_item_name VARCHAR(50) NOT NULL
);

CREATE TABLE steps (
    step_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    step_order INT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    step_due_date TIMESTAMP,

    CONSTRAINT fk_steps_user
        FOREIGN KEY (user_id)
        REFERENCES user_info(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_step_name
        UNIQUE (user_id, step_name),

    CONSTRAINT unique_user_step_order
        UNIQUE (user_id, step_order)
);

CREATE TABLE user_todos (
    user_id INT NOT NULL,
    todo_id INT NOT NULL,
    step_id INT,
    reminder_date TIMESTAMP,
    due_date TIMESTAMP,
    current_status VARCHAR(20) DEFAULT 'Pending',

    PRIMARY KEY (user_id, todo_id),

    CONSTRAINT fk_user_todos
        FOREIGN KEY (user_id)
        REFERENCES user_info(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_todo
        FOREIGN KEY (todo_id)
        REFERENCES todo_items(todo_id)
        ON DELETE CASCADE,
        
	CONSTRAINT fk_step
        FOREIGN KEY (step_id)
        REFERENCES steps(step_id)
        ON DELETE SET NULL
);