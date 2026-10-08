import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { supabase } from './config/db.js';
import kamarRoutes from './routes/kamarRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import perbaikanRoutes from './routes/perbaikanRoutes.js';
import pengumumanRoutes from './routes/pengumumanRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import pesanRoutes from './routes/pesanRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { expireBookings } from './controllers/bookingController.js';
import { generateTagihanBulanan, cekKeterlambatan, pengingatJatuhTempo } from './jobs/cronJobs.js';
import { protect } from './middlewares/auth.js';

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

app.post('/api/admin/generate-tagihan', protect(['admin']), async (req, res) => {
  try {
    const result = await generateTagihanBulanan();
    return res.json({ data: result, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/admin/cek-keterlambatan', protect(['admin']), async (req, res) => {
  try {
    const result = await cekKeterlambatan();
    return res.json({ data: result, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'SmartKos API is running' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    console.log('Supabase connected successfully');

    cron.schedule('0 * * * *', () => {
      console.log('[CRON] Running booking expiration job...');
      expireBookings();
    });

    cron.schedule('5 0 1 * *', () => {
      console.log('[CRON] Running generateTagihanBulanan...');
      generateTagihanBulanan();
    });

    cron.schedule('0 * * * *', () => {
      console.log('[CRON] Running cekKeterlambatan...');
      cekKeterlambatan();
    });

    cron.schedule('0 8 * * *', () => {
      console.log('[CRON] Running pengingatJatuhTempo...');
      pengingatJatuhTempo();
    });

    console.log('[CRON] All jobs scheduled');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Supabase connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
})();
