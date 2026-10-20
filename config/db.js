const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Memanggil URL MongoDB dari file .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database MongoDB berhasil terkoneksi!');
  } catch (error) {
    console.error('Koneksi MongoDB gagal:', error.message);
    process.exit(1); // Menghentikan server jika gagal konek
  }
};

module.exports = connectDB;