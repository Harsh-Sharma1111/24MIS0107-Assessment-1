CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sprints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planned', 'active', 'completed') NOT NULL DEFAULT 'planned'
);

CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    sprint_id BIGINT,
    assignee_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Explicit Indexes
    INDEX idx_task_status (status),
    INDEX idx_task_sprint_id (sprint_id),
    INDEX idx_task_assignee_id (assignee_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_task_sprint 
        FOREIGN KEY (sprint_id) 
        REFERENCES sprints(id) 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_task_assignee 
        FOREIGN KEY (assignee_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);
