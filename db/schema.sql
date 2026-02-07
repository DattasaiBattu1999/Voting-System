CREATE DATABASE voting_system;
USE voting_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    password VARCHAR(255),
    role ENUM('VOTER','ADMIN')
);

CREATE TABLE elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT,
    name VARCHAR(100),
    FOREIGN KEY (election_id) REFERENCES elections(id)
);

CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    candidate_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);


clea
