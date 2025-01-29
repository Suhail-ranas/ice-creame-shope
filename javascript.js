const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database("./orders.db", (err) => {
  if (err) console.error("Error opening database:", err.message);
  else {
    db.run(
      "CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, name TEXT, phone TEXT, address TEXT, details TEXT)",
      (err) => {
        if (err) console.error("Error creating table:", err.message);
      }
    );
  }
});

// API Endpoints

// Save a new order
app.post("/order", (req, res) => {
  const { name, phone, address, details } = req.body;
  if (!name || !phone || !address || !details) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `INSERT INTO orders (name, phone, address, details) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, phone, address, details], function (err) {
    if (err) {
      console.error("Error saving order:", err.message);
      return res.status(500).json({ message: "Failed to save order" });
    }
    res.status(201).json({ message: "Order placed successfully", orderId: this.lastID });
  });
});

// Get all orders
app.get("/orders", (req, res) => {
  const query = "SELECT * FROM orders";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching orders:", err.message);
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
    res.status(200).json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
