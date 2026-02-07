const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

/**
 * POST /login
 * Switzerland-style voter authentication using National ID
 */
router.post("/login", (req, res) => {
  const { national_id, password } = req.body;

  if (!national_id || !password) {
    return res.status(400).send("Missing credentials");
  }

  db.query(
    "SELECT id, role FROM users WHERE national_id=? AND password=?",
    [national_id, password],
    (err, result) => {
      if (err) return res.status(500).send("DB error");
      if (result.length === 0) return res.status(401).send("Invalid login");

      const token = jwt.sign(
        { userId: result[0].id, role: result[0].role },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        role: result[0].role
      });
    }
  );
});

module.exports = router;
