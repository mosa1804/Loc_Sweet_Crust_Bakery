import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Routes

// Get all orders
app.get('/api/orders', (req, res) => {
  const sql = 'SELECT * FROM Orders ORDER BY Order_ID DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new order
app.post('/api/orders', (req, res) => {
  const { orderId, customer, product, quantity, order_date, status } = req.body;
  
  // Check if all fields are filled
  if (!orderId || !customer || !product || !quantity || !order_date || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO Orders (Order_ID, Customer_Name, Product, Quantity, Order_date, Status) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [orderId, customer, product, quantity, order_date, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Just send success message - frontend will reload all orders
    res.json({ message: 'Order added successfully', orderId: orderId });
  });
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const sql = 'UPDATE Orders SET Status = ? WHERE Order_ID = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Status updated successfully' });
  });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Orders WHERE Order_ID = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));