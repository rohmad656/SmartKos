import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import pool from './config/db.js';
import kamarRoutes from './routes/kamarRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import perbaikanRoutes from './routes/perbaikanRoutes.js';
import pengumumanRoutes from './routes/pengumumanRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import pesanRoutes from './routes/pesanRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/kamar', kamarRoutes);
app.use('/api/penghuni', penghuniRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/perbaikan', perbaikanRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/pesan', pesanRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SmartKos API is running' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Full error:', err);
    console.error('Code:', err.code);
    console.error('Details:', JSON.stringify({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      url: process.env.DATABASE_URL ? 'set' : 'not set'
    }));
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
