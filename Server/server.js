const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "MY_SECRET_123";

// ----------------- MySQL Connection -----------------

const db = mysql.createConnection({
  host: "localhost",
  user: "sarang",
  password: "sarang",
  database: "neelam",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ MySQL Connected Successfully");
});

// ----------------- Auto Create Tables -----------------

// USERS TABLE
db.query(`
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255)
)
`);

// CATEGORIES TABLE
db.query(`
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE
)
`);

// TRANSACTIONS TABLE
db.query(`
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(255),
  category_type VARCHAR(20), 
  description TEXT,
  image_url VARCHAR(500),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// ----------------- REGISTER -----------------

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required!" });

  const hashedPass = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPass],
    (err) => {
      if (err) return res.status(400).json({ error: "Email already exists" });
      res.json({ message: "User registered successfully" });
    }
  );
});

// ----------------- LOGIN -----------------

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Server error" });

      if (results.length === 0)
        return res.status(400).json({ error: "User not found" });

      const user = results[0];

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(400).json({ error: "Incorrect password" });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ message: "Login successful", token, user });
    }
  );
});

// ----------------- ADD CATEGORY -----------------

app.post("/add-category", (req, res) => {
  const { category } = req.body;

  if (!category || !category.trim()) {
    return res.status(400).json({ error: "Category is required" });
  }

  db.query(
    "INSERT INTO categories (name) VALUES (?)",
    [category.trim()],
    (err, result) => {
      if (err)
        return res.status(400).json({ error: "Category already exists" });

      res.json({ message: "Category added", id: result.insertId });
    }
  );
});


// ----------------- GET CATEGORIES -----------------

app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
});

// ----------------- ADD TRANSACTION -----------------

app.post("/add-transactions", (req, res) => {
  const { name, category, category_type, description, image_url, amount } =
    req.body;

  if (!name || !category || !category_type)
    return res
      .status(400)
      .json({ error: "name, category, category_type are required" });

  const sql = `
    INSERT INTO transactions 
      (name, category, category_type, description, image_url, amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      category,
      category_type,
      description || null,
      image_url || null,
      amount || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Transaction added", id: result.insertId });
    }
  );
});

// ----------------- GET TRANSACTIONS -----------------

app.get("/transactions", (req, res) => {
  db.query("SELECT * FROM transactions ORDER BY created_at DESC", (err, data) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(data);
  });
});

// ----------------- SERVER START -----------------

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
