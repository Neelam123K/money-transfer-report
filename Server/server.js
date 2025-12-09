const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "MY_SECRET_123";

let db;

// ----------------- MySQL Connection -----------------

(async () => {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "sarang",
      password: "sarang",
      database: "neelam",
    });

    console.log("✅ MySQL Connected Successfully");

    // AUTO TABLE CREATION
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        first_login TINYINT(1) DEFAULT 1
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(255),
        category_type VARCHAR(20),
        description TEXT,
        image_url VARCHAR(500),
        amount DECIMAL(10,2),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
  }
})();


// ----------------- REGISTER -----------------

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPass]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});


// ----------------- LOGIN -----------------

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
  "SELECT id, name, email, password, first_login FROM users WHERE email = ?",
  [email]
);


    if (rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// ----------------- ADD CATEGORY -----------------

app.post("/add-category", async (req, res) => {
  try {
    const { category } = req.body;

    const [exists] = await db.query(
      "SELECT * FROM categories WHERE name = ?",
      [category]
    );

    if (exists.length > 0)
      return res.status(400).json({ error: "Category already exists" });

    await db.query("INSERT INTO categories (name) VALUES (?)", [category]);

    res.json({ message: "Category added successfully" });

  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// ----------------- GET CATEGORIES -----------------

app.get("/categories", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories");
  res.json(rows);
});


// ----------------- ADD TRANSACTION -----------------

app.post("/transaction", async (req, res) => {
  try {
    const { name, category, category_type, description, image_url, amount, user_id } = req.body;

    const sql = `
      INSERT INTO transactions 
      (name, category, category_type, description, image_url, amount, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name, category, category_type, description, image_url, amount, user_id
    ]);

    res.json({ message: "Transaction added", id: result.insertId });

  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// ----------------- GET TRANSACTIONS BY USER -----------------

app.get("/transactions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );
    res.json(rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching transactions" });
  }
});


// ----------------- ADD TRANSACTION (UPDATED) -----------------

app.post("/add-transaction", async (req, res) => {
  try {
    const {
      name,
      category,
      category_type,
      description,
      image_url,
      amount,
      user_id
    } = req.body;

    const sql = `
      INSERT INTO transactions 
      (name, category, category_type, description, image_url, amount, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      category,
      category_type,
      description,
      image_url,
      amount,
      user_id,
    ]);

    res.json({ message: "Transaction added", id: result.insertId });

  } catch (err) {
    console.log("Transaction Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// ----------------- UPDATE FIRST LOGIN -----------------

app.put("/first-login-update/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("UPDATE users SET first_login = 0 WHERE id = ?", [id]);

  res.json({ message: "First login updated" });
});

// ----------------- STATIC FRONTEND (Vite Build) -----------------

const distPath = path.join(__dirname, "..", "Client", "dist");

app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


// ----------------- SERVER RUN -----------------

app.listen(5000, () => console.log("Server running on port 5000"));
