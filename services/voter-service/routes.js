const express = require("express");
const mysql = require("mysql2");
const authMiddleware = require("./authMiddleware");
const axios = require("axios");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

/*************************************************
 * CHECK IF USER ALREADY VOTED
 *************************************************/
router.get("/status", authMiddleware, (req, res) => {
  const userId = req.user.userId;

  db.query(
    "SELECT id FROM votes WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).send("DB error");

      res.json({
        hasVoted: result.length > 0
      });
    }
  );
});

/*************************************************
 * CAST VOTE (ONLY IF NOT VOTED & ELECTION OPEN)
 *************************************************/
router.post("/vote", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { candidate_id } = req.body;

  if (!candidate_id) {
    return res.status(400).send("Missing candidate");
  }

  try {
    // 🔴 CHECK ELECTION STATUS
    const statusRes = await axios.get(
      "http://localhost:3003/election/status"
    );

    if (statusRes.data.status !== "OPEN") {
      return res.status(403).send("Election is closed");
    }

    // 🗳️ INSERT VOTE
    db.query(
      "INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)",
      [userId, candidate_id],
      err => {
        if (err) {
          return res.status(409).send("User already voted");
        }
        res.send("Vote recorded successfully");
      }
    );
  } catch (error) {
    res.status(500).send("Election service unavailable");
  }
});

module.exports = router;
