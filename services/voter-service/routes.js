const express = require("express");
const mysql = require("mysql2");
const authMiddleware = require("./authMiddleware");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

// 🔐 Protected vote route
router.post("/vote", authMiddleware, (req, res) => {
  const userId = req.user.userId;   // extracted from JWT
  const { candidate_id } = req.body;

  if (!candidate_id) {
    return res.status(400).send("Missing candidate");
  }

  db.query(
    "INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)",
    [userId, candidate_id],
    (err) => {
      if (err) {
        return res.status(409).send("User already voted");
      }
      res.send("Vote recorded successfully");
    }
  );
});

module.exports = router;
