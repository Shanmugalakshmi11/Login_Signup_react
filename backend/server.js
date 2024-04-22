const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345", // Replace with your MySQL password
  database: "signup",
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, hashedPassword];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting user into database:", err);
        return res.status(500).json({ error: "Failed to sign up" });
      }
      console.log("User inserted into database successfully");
      res.status(201).json({ message: "SUCCESS" });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Failed to sign up" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM login WHERE email = ?";
  const values = [email];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("Error executing login query:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      console.log("Login failed. User not found.");
      return res.status(401).json("FAIL");
    }

    const user = result[0];
    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("Login successful");
        return res.status(200).json("SUCCESS");
      } else {
        console.log("Login failed. Incorrect password.");
        return res.status(401).json("FAIL");
      }
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

const PORT = 6061;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
