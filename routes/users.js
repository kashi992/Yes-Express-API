const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Adjust the path accordingly

router.post('/addUser', (req, res) => {
  const { name, email, password, city, country } = req.body;

  const sql = 'INSERT INTO users (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, password, city, country], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error adding user' });
    } else {
      res.status(201).json({ message: 'User added successfully' });
    }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error logging in' });
    } else {
      if (result.length === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
      } else {
        res.status(200).json(result[0]);
      }
    }
  });
});

module.exports = router;
