/* =====================================================
   DATABASE
===================================================== */
CREATE DATABASE IF NOT EXISTS voting_system;
USE voting_system;

/* =====================================================
   USERS TABLE (ADMIN + VOTERS)
===================================================== */
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  national_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','VOTER') NOT NULL
);

/* =====================================================
   CANDIDATES TABLE (WITH PARTY + SOFT DELETE)
===================================================== */
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  party VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =====================================================
   ELECTION STATUS (SINGLE ROW TABLE)
===================================================== */
CREATE TABLE IF NOT EXISTS election_status (
  id INT PRIMARY KEY,
  status ENUM('OPEN','CLOSED') NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* Ensure single row exists */
INSERT IGNORE INTO election_status (id, status)
VALUES (1, 'CLOSED');

/* =====================================================
   VOTES TABLE (ONE USER = ONE VOTE)
===================================================== */
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  candidate_id INT,
  device_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

/* =====================================================
   AUDIT LOGS (OPTIONAL / FUTURE USE)
===================================================== */
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  details VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =====================================================
   INDEXES (PERFORMANCE)
===================================================== */
CREATE INDEX idx_votes_candidate ON votes(candidate_id);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, timestamp);

/* =====================================================
   COMMON PASSWORD (FOR PRACTICE ONLY)
   Plain password: password123
   Replace hash if needed
===================================================== */
-- Example bcrypt hash for "password123"
-- (You can regenerate, but reuse for all users)
SET @COMMON_PASSWORD_HASH =
'$2b$10$8Z2G6F0zJYp4Yw2m7W6R8O4FzYHqZ1kN7pXqXn6W4u1Dk1ZbJpW1S';

/* =====================================================
   INSERT ADMIN USER
===================================================== */
INSERT INTO users (national_id, password_hash, role)
VALUES ('ADMIN001', @COMMON_PASSWORD_HASH, 'ADMIN');

/* =====================================================
   INSERT VOTERS (ALL SAME PASSWORD)
===================================================== */
INSERT INTO users (national_id, password_hash, role) VALUES
('VOTER001', @COMMON_PASSWORD_HASH, 'VOTER'),
('VOTER002', @COMMON_PASSWORD_HASH, 'VOTER'),
('VOTER003', @COMMON_PASSWORD_HASH, 'VOTER'),
('VOTER004', @COMMON_PASSWORD_HASH, 'VOTER');

/* =====================================================
   INSERT CANDIDATES
===================================================== */
INSERT INTO candidates (name, party) VALUES
('Dattasai', 'TDP'),
('Ramesh', 'INC'),
('Suresh', 'BJP');

/* =====================================================
   OPTIONAL: OPEN ELECTION
===================================================== */
-- Uncomment when you want voting to start
-- UPDATE election_status SET status='OPEN', updated_at=NOW() WHERE id=1;
