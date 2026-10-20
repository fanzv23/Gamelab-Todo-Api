require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // <-- Menarik file db.js

const app = express();
const port = process.env.PORT || 3000;

// Jalankan koneksi ke database
connectDB(); // <-- Memanggil fungsinya di sini

// Middleware agar bisa membaca input format JSON
app.use(express.json());

// Rute tes awal
app.get('/', (req, res) => {
  res.send('Server Todo API milik Fanzv sudah berjalan dan siap ngoding!');
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berhasil jalan di http://localhost:${port}`);
});