const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

/*************************************************
 * LOGIN (BCRYPT BASED)
 *************************************************/
router.post("/login", (req, res) => {
  const { national_id, password } = req.body;

  if (!national_id || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  db.query(
    "SELECT id, role, password_hash FROM users WHERE national_id = ?",
    [national_id],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result[0];

      // 🔐 Compare bcrypt password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // 🔑 Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role
      });
    }
  );
});

/*************************************************
 * REGISTER (VOTER ONLY)
 *************************************************/
router.post("/register", async (req, res) => {
  const { national_id, password } = req.body;

  if (!national_id || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (national_id, password_hash, role) VALUES (?, ?, 'VOTER')",
      [national_id, hash],
      err => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "User already exists" });
          }
          return res.status(500).json({ message: "DB error" });
        }

        res.status(201).json({ message: "Voter registered successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

module.exports = router;
