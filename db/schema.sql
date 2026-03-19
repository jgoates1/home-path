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

-- Master list of available todo templates (used by user_todos feature)
CREATE TABLE IF NOT EXISTS todo_items (
  todo_id        SERIAL PRIMARY KEY,
  todo_item_name VARCHAR(200) NOT NULL
);

-- User-specific todo assignments (used by /api/todos and /api/steps/:id/todos)
CREATE TABLE IF NOT EXISTS user_todos (
  user_id        INT NOT NULL REFERENCES user_info(user_id) ON DELETE CASCADE,
  todo_id        INT NOT NULL REFERENCES todo_items(todo_id) ON DELETE CASCADE,
  step_id        INT REFERENCES steps(step_id) ON DELETE SET NULL,
  reminder_date  TIMESTAMP,
  due_date       TIMESTAMP,
  current_status VARCHAR(30) DEFAULT 'Pending',
  CONSTRAINT user_todos_pkey PRIMARY KEY (user_id, todo_id)
);

CREATE TABLE IF NOT EXISTS survey_questions (
  question_id   SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_responses (
  response_id   SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES user_info(user_id) ON DELETE CASCADE,
  question_id   INT NOT NULL REFERENCES survey_questions(question_id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  CONSTRAINT unique_user_question UNIQUE (user_id, question_id)
);