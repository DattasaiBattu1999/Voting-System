const express = require("express");
const mysql = require("mysql2");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

/**
 * POST /vote
 * One-person-one-vote enforcement
 */
router.post("/vote", (req, res) => {
  const { user_id, candidate_id } = req.body;

  if (!user_id || !candidate_id) {
    return res.status(400).send("Missing vote data");
  }

  db.query(
    "INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)",
    [user_id, candidate_id],
    (err) => {
      if (err) {
        return res.status(409).send("User has already voted");
      }
      res.send("Vote cast successfully");
    }
  );
});

module.exports = router;
